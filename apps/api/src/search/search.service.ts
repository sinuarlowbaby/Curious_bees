import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../embeddings/embedding.service';
import { SearchAnalyticsService } from './search-analytics.service';

export interface SearchResult {
  id: string;
  title: string;
  eventType: string;
  department: string | null;
  venue: string;
  date: Date;
  time: string;
  tags: string[];
  status: string;
  priority: string;
  confidence: number;
  score: number; // cosine similarity (0-1, higher = more relevant)
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly analytics: SearchAnalyticsService,
  ) {}

  /**
   * Performs semantic vector search using pgvector cosine similarity.
   */
  async semanticSearch(
    query: string,
    filters?: { department?: string; eventType?: string; status?: string; limit?: number },
    userId?: string,
  ): Promise<SearchResult[]> {
    const startTime = Date.now();
    let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let errorMsg: string | undefined;
    const limit = filters?.limit || 10;

    try {
      const embedding = await this.embeddingService.generateEmbedding(query);

      // If embedding failed, fall back to text search
      if (!embedding) {
        this.logger.warn('Embedding failed for query — falling back to text search');
        status = 'FAILED';
        errorMsg = 'Embedding failed — text fallback';
        
        // Log telemetry for fallback/failed embedding search
        await this.prisma.aIObservabilityLog.create({
          data: {
            operationName: 'semantic_search',
            latencyMs: Date.now() - startTime,
            status: 'FAILED',
            errorMessage: 'Embedding generation failed for query',
            metadata: { query, filters }
          }
        }).catch(() => {});

        return this.fallbackTextSearch(query, filters);
      }

      const vectorLiteral = `[${embedding.join(',')}]`;

      // Build WHERE clauses dynamically
      const conditions: string[] = [`embedding IS NOT NULL`];
      if (filters?.department) conditions.push(`department = '${filters.department.replace(/'/g, "''")}'`);
      if (filters?.eventType) conditions.push(`"eventType" = '${filters.eventType.replace(/'/g, "''")}'`);
      if (filters?.status) conditions.push(`status = '${filters.status}'`);
      else conditions.push(`status != 'FAILED'`);

      const whereClause = conditions.join(' AND ');

      const results: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT
          id, title, "eventType", department, venue, date, time, tags, status, priority, confidence,
          1 - (embedding <=> '${vectorLiteral}'::vector) AS score
        FROM "Event"
        WHERE ${whereClause}
        ORDER BY embedding <=> '${vectorLiteral}'::vector
        LIMIT ${limit}
      `);

      const topScore = results[0]?.score ?? null;

      // Track analytics async
      this.analytics.record({ query, userId, resultCount: results.length, topScore, filters }).catch(() => {});

      // Log success telemetry
      const latencyMs = Date.now() - startTime;
      await this.prisma.aIObservabilityLog.create({
        data: {
          operationName: 'semantic_search',
          latencyMs,
          status: 'SUCCESS',
          metadata: { query, resultCount: results.length, topScore }
        }
      }).catch(() => {});

      return results.map(r => ({ ...r, score: parseFloat(r.score?.toFixed(4) ?? '0') }));

    } catch (error: any) {
      // Log failed search telemetry
      const latencyMs = Date.now() - startTime;
      await this.prisma.aIObservabilityLog.create({
        data: {
          operationName: 'semantic_search',
          latencyMs,
          status: 'FAILED',
          errorMessage: error.message,
          metadata: { query, filters }
        }
      }).catch(() => {});
      throw error;
    }
  }

  /**
   * Finds N nearest neighbor events to a given event (related events).
   */
  async getRelatedEvents(eventId: string, limit = 5): Promise<SearchResult[]> {
    // Get the source event's embedding
    const events: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT embedding FROM "Event" WHERE id = $1 AND embedding IS NOT NULL
    `, eventId);

    if (events.length === 0) {
      this.logger.warn(`Event ${eventId} has no embedding yet — returning empty related list`);
      return [];
    }

    const embeddingStr = events[0].embedding;

    const results: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT
        id, title, "eventType", department, venue, date, time, tags, status, priority, confidence,
        1 - (embedding <=> '${embeddingStr}'::vector) AS score
      FROM "Event"
      WHERE id != $1 AND embedding IS NOT NULL AND status != 'FAILED'
      ORDER BY embedding <=> '${embeddingStr}'::vector
      LIMIT $2
    `, eventId, limit);

    return results.map(r => ({ ...r, score: parseFloat(r.score?.toFixed(4) ?? '0') }));
  }

  /**
   * Personalized recommendations for a user based on their UserPreference.
   * Builds a synthetic "user interest vector" from their tags and department.
   */
  async getPersonalizedRecommendations(userId: string, limit = 8): Promise<SearchResult[]> {
    const pref = await this.prisma.userPreference.findUnique({ where: { userId } });

    // Build personalization query from user preferences
    const queryParts: string[] = [];
    if (pref?.department) queryParts.push(pref.department);
    if (pref?.eventType) queryParts.push(pref.eventType);
    if (pref?.tags?.length) queryParts.push(pref.tags.join(' '));

    const personalQuery = queryParts.length > 0
      ? queryParts.join(' ')
      : 'research seminar workshop academic';

    return this.semanticSearch(personalQuery, { status: 'PUBLISHED', limit }, userId);
  }

  /**
   * Returns trending events based on recent tag frequency (last 30 days).
   */
  async getTrending(limit = 6): Promise<any[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const events = await this.prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, title: true, eventType: true, department: true, tags: true, date: true, venue: true, priority: true, confidence: true, status: true, time: true },
    });

    // Score by tag frequency as proxy for "trending"
    const tagFreq: Record<string, number> = {};
    events.forEach(e => e.tags.forEach(t => { tagFreq[t] = (tagFreq[t] || 0) + 1; }));

    const scored = events.map(e => ({
      ...e,
      trendScore: e.tags.reduce((acc, t) => acc + (tagFreq[t] || 0), 0),
    }));

    return scored
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit);
  }

  /**
   * Text-based fallback when embeddings are unavailable.
   */
  private async fallbackTextSearch(query: string, filters?: any): Promise<SearchResult[]> {
    const events = await this.prisma.event.findMany({
      where: {
        status: { not: 'FAILED' },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { topic: { contains: query, mode: 'insensitive' } },
          { department: { contains: query, mode: 'insensitive' } },
          { eventType: { contains: query, mode: 'insensitive' } },
        ],
        ...(filters?.department ? { department: filters.department } : {}),
      },
      take: filters?.limit || 10,
    });

    return events.map(e => ({ ...e, score: 0.5 })) as any[];
  }
}
