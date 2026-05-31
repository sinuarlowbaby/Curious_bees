import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsService } from './analytics.service';
import { TrendService } from './trend.service';
import { ClusterService } from './cluster.service';
import { ObservabilityService } from './observability.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BullModule.registerQueue(
      { name: 'event-embedding-generation' },
      { name: 'event-notifications' },
      { name: 'ai-processing' }
    ),
  ],
  providers: [
    AnalyticsService,
    TrendService,
    ClusterService,
    ObservabilityService
  ],
  controllers: [AnalyticsController],
  exports: [
    AnalyticsService,
    ObservabilityService,
    TrendService,
    ClusterService
  ]
})
export class AnalyticsModule {}
