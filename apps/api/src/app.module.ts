import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ThreadsModule } from './threads/threads.module';
import { CommentsModule } from './comments/comments.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AiProcessingQueueModule } from './queues/ai-processing.queue.module';
import { GmailModule } from './gmail/gmail.module';
import { EmbeddingModule } from './embeddings/embedding.module';
import { SearchModule } from './search/search.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CopilotModule } from './copilot/copilot.module';
import { WorkspacesModule } from './workspaces/workspaces.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ThreadsModule,
    CommentsModule,
    OpportunitiesModule,
    EventsModule,
    AiProcessingQueueModule,
    GmailModule,
    NotificationsModule,
    EmbeddingModule,
    SearchModule,
    AnalyticsModule,
    CopilotModule,
    WorkspacesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

