import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventsProcessor } from './events.processor';
import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-event-processing',
    }),
    EventsModule,
    NotificationsModule
  ],
  providers: [EventsProcessor],
  exports: [BullModule]
})
export class EventsQueueModule {}
