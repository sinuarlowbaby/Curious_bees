import { Controller, Get, Post, Body, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { AnalyticsService } from './analytics.service';
import { TrendService } from './trend.service';
import { ClusterService } from './cluster.service';
import { ObservabilityService } from './observability.service';

@Controller('analytics')
@UseGuards(FirebaseAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly trendService: TrendService,
    private readonly clusterService: ClusterService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  /**
   * GET /api/analytics/overview?timeRange=30d&department=CSE
   * Core summary metrics (Total Events, Growth timeline, AI confidence, Notification rates).
   */
  @Get('overview')
  async overview(
    @Query('timeRange') timeRange?: string,
    @Query('department') department?: string,
  ) {
    return this.analyticsService.getOverview(timeRange, department);
  }

  /**
   * GET /api/analytics/trends
   * Trending topics, growing departments, and statistical insights.
   */
  @Get('trends')
  async trends() {
    return this.trendService.getTrends();
  }

  /**
   * GET /api/analytics/clusters
   * Lists semantic clusters and events grouped by the pgvector engine.
   */
  @Get('clusters')
  async clusters() {
    return this.clusterService.getClusters();
  }

  /**
   * POST /api/analytics/trigger-clustering
   * Triggers the pgvector dynamic leader clustering engine manually.
   */
  @Post('trigger-clustering')
  async triggerClustering() {
    return this.clusterService.clusterEvents();
  }

  /**
   * GET /api/analytics/departments
   * Provides departmental volume and metric comparison.
   */
  @Get('departments')
  async departments(@Query('timeRange') timeRange?: string) {
    const overview = await this.analyticsService.getOverview(timeRange);
    return {
      departments: overview.departmentsActivity,
      timeline: overview.growthTimeline,
    };
  }

  /**
   * GET /api/analytics/research
   * Interdisciplinary tag overlap heatmaps and collaboration stats.
   */
  @Get('research')
  async research() {
    return this.analyticsService.getResearchIntelligence();
  }

  /**
   * GET /api/analytics/engagement
   * Engagement rankings, popularity index, and notification rates.
   */
  @Get('engagement')
  async engagement() {
    const results = await this.analyticsService.getEngagementMetrics();
    return { results };
  }

  /**
   * POST /api/analytics/engagement/click
   * Records click-through interactions on recommendation cards.
   */
  @Post('engagement/click')
  async logClick(
    @Req() req: any,
    @Body('eventId') eventId: string,
  ) {
    if (!eventId) return { success: false, reason: 'eventId is required' };
    await this.analyticsService.recordEngagement(req.user.id, eventId, 'CLICK');
    return { success: true };
  }

  /**
   * GET /api/analytics/observability
   * Host diagnostics, queue throughput, and SLM extraction latency.
   */
  @Get('observability')
  async observability() {
    return this.observabilityService.getMetrics();
  }

  /**
   * GET /api/analytics/export?type=overview
   * Serves direct downloads of institutional metrics in CSV format.
   */
  @Get('export')
  async export(
    @Query('type') type = 'overview',
    @Res() res: Response,
  ) {
    const csvContent = await this.analyticsService.getCsvExport(type);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="recollab-analytics-${type}-${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  }
}
