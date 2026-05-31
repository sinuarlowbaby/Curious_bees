import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../embeddings/embedding.service';

export interface RetrievalResult {
  id: string;
  title: string;
  eventType: string;
  department: string | null;
  venue: string;
  date: Date;
  time: string;
  tags: string[];
  priority: string;
  confidence: number;
  score: number; // Hybrid ranking score
}

@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  /**
   * Retrieves semantically relevant events using a high-fidelity hybrid scoring algorithm.
   */
  async retrieveRelevantEvents(query: string, userId?: string, limit = 8): Promise<RetrievalResult[]> {
    try {
      // 1. Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      let rawEvents: any[] = [];

      if (queryEmbedding) {
        const vectorLiteral = `[${queryEmbedding.join(',')}]`;
        
        // Semantic search vector query
        rawEvents = await this.prisma.$queryRawUnsafe(`
          SELECT
            id, title, "eventType", department, venue, date, time, tags, priority, confidence, status, "createdAt",
            1 - (embedding <=> '${vectorLiteral}'::vector) AS similarity
          FROM "Event"
          WHERE embedding IS NOT NULL AND status = 'PUBLISHED'
          ORDER BY embedding <=> '${vectorLiteral}'::vector ASC
          LIMIT 30
        `);
      } else {
        // Fallback to database keyword search
        this.logger.warn('Embedding failed — using database text search fallback');
        rawEvents = await this.prisma.event.findMany({
          where: {
            status: 'PUBLISHED',
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { topic: { contains: query, mode: 'insensitive' } },
              { department: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 30,
        });
        rawEvents = rawEvents.map(e => ({ ...e, similarity: 0.5 }));
      }

      // 2. Fetch engagement scores for hybrid popularity ranking
      const eventIds = rawEvents.map(e => e.id);
      const engagementScores = await this.prisma.engagementScore.findMany({
        where: { eventId: { in: eventIds } },
      });
      const scoreMap: Record<string, number> = {};
      engagementScores.forEach(s => {
        scoreMap[s.eventId] = s.popularityScore;
      });

      // 3. Fetch user preference overlays for personalized ranking
      let userPref: any = null;
      if (userId) {
        userPref = await this.prisma.userPreference.findUnique({ where: { userId } });
      }

      const now = new Date().getTime();

      // 4. Compute hybrid score for each retrieved event
      const scoredResults = rawEvents.map(e => {
        const similarity = parseFloat(e.similarity?.toString() ?? '0.5');

        // Recency exponential decay (halflife of roughly 4 weeks)
        const eventCreatedAt = new Date(e.createdAt || e.date).getTime();
        const weeksOld = Math.max(0, (now - eventCreatedAt) / (7 * 24 * 60 * 60 * 1000));
        const recencyWeight = Math.pow(0.93, weeksOld);

        // Popularity score normalization (clamped log scale to prevent outliers)
        const popScore = scoreMap[e.id] || 0;
        const popularityWeight = popScore > 0 ? Math.min(1.0, Math.log1p(popScore) / 4) : 0;

        // Priority scaling
        let priorityMultiplier = 1.0;
        if (e.priority === 'CRITICAL') priorityMultiplier = 1.35;
        else if (e.priority === 'HIGH') priorityMultiplier = 1.15;
        else if (e.priority === 'LOW') priorityMultiplier = 0.8;

        // User preference personalization boost
        let personalizationMultiplier = 1.0;
        if (userPref) {
          const deptMatch = userPref.department && e.department?.toLowerCase() === userPref.department.toLowerCase();
          const tagOverlap = userPref.tags && e.tags.some((t: string) => userPref.tags.includes(t));
          if (deptMatch || tagOverlap) {
            personalizationMultiplier = 1.25;
          }
        }

        // Linear Combination Formula:
        // Score = (Similarity * 0.5 + Recency * 0.35 + Popularity * 0.15) * Priority * Personalization
        const hybridScore = (similarity * 0.5 + recencyWeight * 0.35 + popularityWeight * 0.15) * priorityMultiplier * personalizationMultiplier;

        return {
          id: e.id,
          title: e.title,
          eventType: e.eventType,
          department: e.department,
          venue: e.venue,
          date: e.date,
          time: e.time,
          tags: e.tags || [],
          priority: e.priority,
          confidence: e.confidence,
          score: parseFloat(hybridScore.toFixed(4)),
        };
      });

      // 5. Rank and return top K
      return scoredResults
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error: any) {
      this.logger.error('Error during hybrid event retrieval:', error);
      return [];
    }
  }
}
