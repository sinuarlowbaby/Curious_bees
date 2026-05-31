import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records recommendation engagements (views, clicks, dismisses) to improve relevance metrics.
   */
  async recordEngagement(userId: string, eventId: string, action: 'VIEW' | 'CLICK' | 'DISMISS'): Promise<void> {
    try {
      await this.prisma.recommendationEngagement.create({
        data: { userId, eventId, action },
      });
      // Trigger dynamic recalculation of scores
      await this.updateEngagementScore(eventId);
    } catch (error) {
      this.logger.error(`Failed to record engagement action:`, error);
    }
  }

  /**
   * Dynamically calculates or updates the EngagementScore for a target event.
   */
  async updateEngagementScore(eventId: string): Promise<void> {
    try {
      const engagements = await this.prisma.recommendationEngagement.findMany({
        where: { eventId },
      });

      const clicks = engagements.filter(e => e.action === 'CLICK').length;
      const views = engagements.filter(e => e.action === 'VIEW').length;

      // Notifications stats
      const notifications = await this.prisma.notification.findMany({
        where: { eventId },
      });
      const totalSent = notifications.length;
      const totalOpened = notifications.filter(n => n.openedStatus).length;

      // Weights: click: 3.0, open: 5.0, view: 0.5, sent: 0.1
      const popularityScore = clicks * 3.0 + totalOpened * 5.0 + views * 0.5 + totalSent * 0.1;
      const openRate = totalSent > 0 ? parseFloat((totalOpened / totalSent).toFixed(4)) : 0;

      // attendance prediction signals
      const event = await this.prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return;

      let predictionScore = 0.5; // Base probability 50%
      if (event.priority === 'CRITICAL') predictionScore += 0.35;
      else if (event.priority === 'HIGH') predictionScore += 0.25;
      else if (event.priority === 'LOW') predictionScore -= 0.2;

      // Boost prediction based on click ratios
      if (views > 0) {
        const ctr = clicks / views;
        predictionScore += ctr * 0.4;
      }
      // Clamp between 0.05 and 0.98
      predictionScore = Math.max(0.05, Math.min(0.98, parseFloat(predictionScore.toFixed(4))));

      await this.prisma.engagementScore.upsert({
        where: { eventId },
        update: { popularityScore, openRate, predictionScore },
        create: { eventId, popularityScore, openRate, predictionScore },
      });

    } catch (error) {
      this.logger.error(`Error recalculating score for event ${eventId}:`, error);
    }
  }

  /**
   * Recalculates campus engagement ranks.
   */
  async refreshEngagementRanks(): Promise<void> {
    try {
      const scores = await this.prisma.engagementScore.findMany({
        orderBy: { popularityScore: 'desc' },
      });

      for (let i = 0; i < scores.length; i++) {
        await this.prisma.engagementScore.update({
          where: { id: scores[i].id },
          data: { engagementRank: i + 1 },
        });
      }
    } catch (error) {
      this.logger.error('Failed to update campus engagement ranks:', error);
    }
  }

  /**
   * Core overview dashboard metrics.
   */
  async getOverview(timeRange = '30d', department?: string): Promise<any> {
    const filterDate = new Date();
    if (timeRange === '7d') filterDate.setDate(filterDate.getDate() - 7);
    else if (timeRange === '90d') filterDate.setDate(filterDate.getDate() - 90);
    else filterDate.setDate(filterDate.getDate() - 30); // 30d default

    const conditions: any = {
      createdAt: { gte: filterDate },
      status: 'PUBLISHED',
    };
    if (department) {
      conditions.department = department;
    }

    // 1. Total events
    const totalEvents = await this.prisma.event.count({ where: conditions });

    // 2. Departmental activity split
    const deptSplits = await this.prisma.event.groupBy({
      by: ['department'],
      where: { status: 'PUBLISHED', createdAt: { gte: filterDate } },
      _count: { id: true },
    });
    const departmentsActivity = deptSplits.map(d => ({
      name: d.department || 'General / SRMIST',
      count: d._count.id,
    })).sort((a, b) => b.count - a.count);

    // 3. Average AI confidence
    const confidenceAggregate = await this.prisma.event.aggregate({
      where: conditions,
      _avg: { confidence: true },
    });
    const avgConfidence = parseFloat(confidenceAggregate._avg.confidence?.toFixed(4) ?? '0.88');

    // 4. Notification engagement rates
    const notificationsCount = await this.prisma.notification.count({
      where: {
        createdAt: { gte: filterDate },
        event: department ? { department } : undefined,
      },
    });
    const notificationsOpened = await this.prisma.notification.count({
      where: {
        createdAt: { gte: filterDate },
        openedStatus: true,
        event: department ? { department } : undefined,
      },
    });
    const notificationEngagementRate = notificationsCount > 0
      ? parseFloat((notificationsOpened / notificationsCount).toFixed(4))
      : 0;

    // 5. Growth timeline histogram (last 4 weeks)
    const growthTimeline: { week: string; count: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date();
      end.setDate(end.getDate() - i * 7);

      const count = await this.prisma.event.count({
        where: {
          ...conditions,
          createdAt: { gte: start, lt: end },
        },
      });
      growthTimeline.push({ week: `Week -${i}`, count });
    }

    return {
      totalEvents,
      departmentsActivity,
      avgConfidence: Math.round(avgConfidence * 100),
      notificationEngagement: {
        totalSent: notificationsCount,
        totalOpened: notificationsOpened,
        ratePercent: Math.round(notificationEngagementRate * 100),
      },
      growthTimeline,
    };
  }

  /**
   * Interdisciplinary research intelligence matrix.
   */
  async getResearchIntelligence(): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all published events
    const events = await this.prisma.event.findMany({
      where: { status: 'PUBLISHED', createdAt: { gte: thirtyDaysAgo } },
      select: { department: true, tags: true },
    });

    // We build a departmental cross-collaboration matrix
    const departments = Array.from(new Set(events.map(e => e.department).filter(Boolean))) as string[];
    const matrix: Record<string, Record<string, number>> = {};

    departments.forEach(d1 => {
      matrix[d1] = {};
      departments.forEach(d2 => {
        matrix[d1][d2] = 0;
      });
    });

    // If events share tags between departments, it counts as collaboration
    events.forEach(e1 => {
      if (!e1.department) return;
      events.forEach(e2 => {
        if (!e2.department || e1.department === e2.department) return;

        // Count overlapping tags
        const overlapping = e1.tags.filter(t => e2.tags.includes(t)).length;
        if (overlapping > 0) {
          matrix[e1.department][e2.department] += 1;
        }
      });
    });

    const heatmapData = departments.flatMap(source => 
      departments.map(target => ({
        source,
        target,
        value: source === target ? 0 : matrix[source][target] || 0,
      }))
    );

    return {
      activeDepartmentsCount: departments.length,
      collaborationMatrix: heatmapData,
    };
  }

  /**
   * Engagement overview and score tables.
   */
  async getEngagementMetrics(): Promise<any[]> {
    // Refresh ranks
    await this.refreshEngagementRanks();

    const scores = await this.prisma.engagementScore.findMany({
      include: {
        event: {
          select: {
            title: true,
            eventType: true,
            department: true,
            date: true,
          },
        },
      },
      orderBy: { popularityScore: 'desc' },
      take: 10,
    });

    return scores.map(s => ({
      eventId: s.eventId,
      title: s.event.title,
      department: s.event.department,
      popularityScore: s.popularityScore,
      openRatePercent: Math.round(s.openRate * 100),
      predictionPercent: Math.round(s.predictionScore * 100),
      rank: s.engagementRank || 1,
    }));
  }

  /**
   * Generates direct CSV downloads of aggregated telemetry data.
   */
  async getCsvExport(type: string): Promise<string> {
    if (type === 'departments') {
      const splits = await this.prisma.event.groupBy({
        by: ['department', 'eventType'],
        where: { status: 'PUBLISHED' },
        _count: { id: true },
      });
      let csv = 'Department,Event Type,Count\n';
      splits.forEach(s => {
        csv += `"${s.department || 'General'}","${s.eventType}",${s._count.id}\n`;
      });
      return csv;
    } else if (type === 'engagement') {
      const rankings = await this.prisma.engagementScore.findMany({
        include: { event: true },
        orderBy: { popularityScore: 'desc' },
      });
      let csv = 'Rank,Event Title,Department,Popularity Score,Notification Open Rate %,Attendance Prediction %\n';
      rankings.forEach(r => {
        csv += `${r.engagementRank || ''},"${r.event.title.replace(/"/g, '""')}","${r.event.department || 'General'}",${r.popularityScore},${Math.round(r.openRate * 100)},${Math.round(r.predictionScore * 100)}\n`;
      });
      return csv;
    } else {
      // Overview stats fallback
      const overview = await this.getOverview();
      let csv = 'Metric,Value\n';
      csv += `Total Published Events,${overview.totalEvents}\n`;
      csv += `Average AI Confidence %,${overview.avgConfidence}\n`;
      csv += `Notification Open %,${overview.notificationEngagement.ratePercent}\n`;
      csv += `Total Notifications Sent,${overview.notificationEngagement.totalSent}\n`;
      return csv;
    }
  }
}
