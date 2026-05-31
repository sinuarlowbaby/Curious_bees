import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as os from 'os';

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('event-embedding-generation') private readonly embeddingQueue: Queue,
    @InjectQueue('event-notifications') private readonly notificationQueue: Queue,
    @InjectQueue('ai-processing') private readonly slmQueue: Queue,
  ) {}

  /**
   * Records a latency or telemetry log in PostgreSQL.
   */
  async record(
    operationName: string,
    latencyMs: number,
    status: 'SUCCESS' | 'FAILED',
    errorMessage?: string,
    retryCount = 0,
    metadata?: any,
  ): Promise<void> {
    try {
      await this.prisma.aIObservabilityLog.create({
        data: {
          operationName,
          latencyMs,
          status,
          errorMessage,
          retryCount,
          metadata: metadata || {},
        },
      });
    } catch (err) {
      this.logger.error(`Failed to record observability log for ${operationName}:`, err);
    }
  }

  /**
   * Gathers active telemetry metrics across DB, SLM processors, and Node.js host load.
   */
  async getMetrics(): Promise<any> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 1. Latency groupings
      const latencies = await this.prisma.aIObservabilityLog.groupBy({
        by: ['operationName'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _avg: { latencyMs: true },
        _count: { id: true },
      });

      const latencyMap: Record<string, { avg: number; count: number }> = {};
      latencies.forEach(l => {
        latencyMap[l.operationName] = {
          avg: parseFloat(l._avg.latencyMs?.toFixed(2) ?? '0'),
          count: l._count.id,
        };
      });

      // 2. Queue aggregations
      const getQueueStats = async (queue: Queue) => {
        const [active, completed, failed, delayed, waiting] = await Promise.all([
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
          queue.getWaitingCount(),
        ]);
        return { active, completed, failed, delayed, waiting, total: active + completed + failed + delayed + waiting };
      };

      const [slmStats, embeddingStats, notificationStats] = await Promise.all([
        getQueueStats(this.slmQueue).catch(() => ({ active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, total: 0 })),
        getQueueStats(this.embeddingQueue).catch(() => ({ active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, total: 0 })),
        getQueueStats(this.notificationQueue).catch(() => ({ active: 0, completed: 0, failed: 0, delayed: 0, waiting: 0, total: 0 })),
      ]);

      // 3. System Host Diagnostics
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memoryUsagePercent = parseFloat(((usedMem / totalMem) * 100).toFixed(2));

      const cpus = os.cpus();
      const cpuModel = cpus[0]?.model ?? 'Unknown';
      const cpuLoad = os.loadavg();

      const processMetrics = {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime(),
      };

      // 4. Ingestion logs counts
      const pipelineCounts = await this.prisma.aIProcessingLog.groupBy({
        by: ['status'],
        _count: { id: true },
      });
      const pipelines: Record<string, number> = {};
      pipelineCounts.forEach(p => {
        pipelines[p.status] = p._count.id;
      });

      return {
        latencies: {
          slmExtraction: latencyMap['slm_extraction'] || { avg: 0, count: 0 },
          embeddingGeneration: latencyMap['embedding_generation'] || { avg: 0, count: 0 },
          semanticSearch: latencyMap['semantic_search'] || { avg: 0, count: 0 },
        },
        queues: {
          slm: slmStats,
          embedding: embeddingStats,
          notification: notificationStats,
        },
        system: {
          memory: {
            totalGb: parseFloat((totalMem / (1024 * 1024 * 1024)).toFixed(2)),
            usedGb: parseFloat((usedMem / (1024 * 1024 * 1024)).toFixed(2)),
            freeGb: parseFloat((freeMem / (1024 * 1024 * 1024)).toFixed(2)),
            percent: memoryUsagePercent,
          },
          cpu: {
            model: cpuModel,
            load1Min: parseFloat(cpuLoad[0].toFixed(2)),
            load5Min: parseFloat(cpuLoad[1].toFixed(2)),
            load15Min: parseFloat(cpuLoad[2].toFixed(2)),
            cores: cpus.length,
          },
          process: {
            memoryRssMb: parseFloat((processMetrics.memoryUsage.rss / (1024 * 1024)).toFixed(2)),
            memoryHeapUsedMb: parseFloat((processMetrics.memoryUsage.heapUsed / (1024 * 1024)).toFixed(2)),
            uptimeSeconds: Math.floor(processMetrics.uptime),
          },
        },
        pipelines,
      };
    } catch (error) {
      this.logger.error('Error computing observability stats:', error);
      return { error: 'Failed to retrieve observability telemetry metrics' };
    }
  }
}
