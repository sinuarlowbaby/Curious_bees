import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiProcessingProcessor } from './ai-processing.processor';
import { OllamaService } from '../ai/ollama.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    EventsModule,
    BullModule.registerQueue({
      name: 'event-email-processing',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    }),
  ],
  providers: [AiProcessingProcessor, OllamaService],
  exports: [BullModule]
})
export class AiProcessingQueueModule {}
