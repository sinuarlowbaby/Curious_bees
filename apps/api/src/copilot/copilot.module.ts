import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { EmbeddingModule } from '../embeddings/embedding.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { RetrievalService } from './retrieval.service';
import { QueryRouterService } from './query-router.service';
import { ContextService } from './context.service';
import { CopilotService } from './copilot.service';
import { CopilotController } from './copilot.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    EmbeddingModule,
    AnalyticsModule
  ],
  providers: [
    RetrievalService,
    QueryRouterService,
    ContextService,
    CopilotService
  ],
  controllers: [CopilotController],
  exports: [CopilotService]
})
export class CopilotModule {}
