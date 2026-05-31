import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmbeddingService } from './embedding.service';
import { EmbeddingProcessor } from './embedding.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'event-embedding-generation',
    }),
  ],
  providers: [EmbeddingService, EmbeddingProcessor],
  exports: [EmbeddingService, BullModule],
})
export class EmbeddingModule {}
