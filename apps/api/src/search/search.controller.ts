import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { ApprovedGuard } from '../auth/approved.guard';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(FirebaseAuthGuard, ApprovedGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * GET /api/search?q=AI+workshop&department=CSE&limit=10
   * Semantic vector search with optional metadata filters.
   */
  @Get()
  async search(
    @Query('q') query: string = '',
    @Query('department') department?: string,
    @Query('eventType') eventType?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ) {
    if (!query.trim()) return { results: [], total: 0 };

    const results = await this.searchService.semanticSearch(
      query,
      {
        department,
        eventType,
        status,
        limit: limit ? parseInt(limit) : 10,
      },
      req?.user?.id,
    );

    return { results, total: results.length, query };
  }

  /**
   * GET /api/search/recommendations
   * Personalized event recommendations for authenticated user.
   */
  @Get('recommendations')
  async recommendations(@Req() req: any) {
    const results = await this.searchService.getPersonalizedRecommendations(req.user.id);
    return { results, total: results.length };
  }

  /**
   * GET /api/search/trending
   * Trending events by tag frequency in the last 30 days.
   */
  @Get('trending')
  async trending(@Query('limit') limit?: string) {
    const results = await this.searchService.getTrending(limit ? parseInt(limit) : 6);
    return { results, total: results.length };
  }
}
