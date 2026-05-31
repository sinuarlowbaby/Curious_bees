import { Injectable, Logger } from '@nestjs/common';

export enum QueryIntent {
  EVENT_SEARCH = 'EVENT_SEARCH',
  ANALYTICS = 'ANALYTICS',
  TRENDS = 'TRENDS',
  RESEARCH = 'RESEARCH',
}

@Injectable()
export class QueryRouterService {
  private readonly logger = new Logger(QueryRouterService.name);

  /**
   * Classifies user natural language query into logical execution routes.
   */
  classifyIntent(query: string): QueryIntent {
    const normalized = query.toLowerCase().trim();

    // 1. Analytics intent
    const analyticsKeywords = [
      'active', 'statistic', 'chart', 'growth', 'output', 'count', 
      'metrics', 'volume', 'split', 'overview', 'dean', 'hod'
    ];
    if (analyticsKeywords.some(kw => normalized.includes(kw))) {
      this.logger.debug(`Routed query to [ANALYTICS]: "${query}"`);
      return QueryIntent.ANALYTICS;
    }

    // 2. Trends intent
    const trendsKeywords = [
      'trend', 'popular', 'growing', 'season', 'theme', 'insight', 
      'rising', 'hot', 'frequent', 'top'
    ];
    if (trendsKeywords.some(kw => normalized.includes(kw))) {
      this.logger.debug(`Routed query to [TRENDS]: "${query}"`);
      return QueryIntent.TRENDS;
    }

    // 3. Research & Clusters intent
    const researchKeywords = [
      'cluster', 'group', 'semantic', 'interdisciplinary', 'collaboration', 
      'heatmap', 'overlap', 'synergy', 'cooperation', 'multidisciplinary'
    ];
    if (researchKeywords.some(kw => normalized.includes(kw))) {
      this.logger.debug(`Routed query to [RESEARCH]: "${query}"`);
      return QueryIntent.RESEARCH;
    }

    // 4. Default to Event Search semantic retrieval
    this.logger.debug(`Routed query to [EVENT_SEARCH]: "${query}"`);
    return QueryIntent.EVENT_SEARCH;
  }
}
