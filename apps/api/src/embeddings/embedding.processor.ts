import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

export interface EmbeddingJob {
  eventId: string;
  title: string;
  eventType: string;
  topic?: string | null;
  tags: string[];
  department?: string | null;
  venue?: string | null;
  description?: string | null;
}

@Processor('event-embedding-generation', {
  concurrency: 2, // protect local Ollama from overload
})
export class EmbeddingProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbeddingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {
    super();
  }

  async process(job: Job<EmbeddingJob>): Promise<any> {
    const { eventId, ...eventData } = job.data;
    this.logger.log(`Generating embedding for event ${eventId}: "${eventData.title}"`);

    const startTime = Date.now();
    let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let errorMsg: string | undefined;
    let embedding: number[] | null = null;

    try {
      const context = this.embeddingService.buildEventContext(eventData);
      embedding = await this.embeddingService.generateEmbedding(context);

      if (!embedding) {
        status = 'FAILED';
        errorMsg = 'Embedding generation failed — null result';
        this.logger.warn(`Embedding generation returned null for event ${eventId}. Will retry.`);
        throw new Error('Embedding generation failed — null result');
      }

      // Store via raw SQL since Prisma does not support vector type natively
      const vectorLiteral = `[${embedding.join(',')}]`;
      await this.prisma.$executeRawUnsafe(
        `UPDATE "Event" SET embedding = $1::vector WHERE id = $2`,
        vectorLiteral,
        eventId,
      );

      this.logger.log(`Successfully stored 768-dim embedding for event ${eventId}`);
      return { eventId, dimensions: embedding.length };

    } catch (error: any) {
      status = 'FAILED';
      errorMsg = error.message;
      throw error;
    } finally {
      const latencyMs = Date.now() - startTime;
      await this.prisma.aIObservabilityLog.create({
        data: {
          operationName: 'embedding_generation',
          latencyMs,
          status,
          errorMessage: errorMsg,
          retryCount: job.attemptsMade,
          metadata: { eventId, title: eventData.title }
        }
      }).catch(err => this.logger.error('Failed to log embedding observability metrics:', err));
    }
  }
}
