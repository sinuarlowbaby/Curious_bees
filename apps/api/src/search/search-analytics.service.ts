import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchAnalyticsService {
  private readonly logger = new Logger(SearchAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persists a search query result for observability. Always fire-and-forget.
   */
  async record(data: {
    query: string;
    userId?: string;
    resultCount: number;
    topScore?: number;
    filters?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.prisma.searchAnalytics.create({
        data: {
          query: data.query,
          userId: data.userId,
          resultCount: data.resultCount,
          topScore: data.topScore,
          filters: data.filters || {},
        },
      });
    } catch (e: any) {
      this.logger.error(`Failed to record search analytics: ${e.message}`);
    }
  }
}
