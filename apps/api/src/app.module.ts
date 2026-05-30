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
import { EventsQueueModule } from './queues/events.queue.module';

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
    EventsQueueModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

