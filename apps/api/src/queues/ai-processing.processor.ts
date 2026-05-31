import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OllamaService } from '../ai/ollama.service';
import { EventPersistenceService } from '../events/event-persistence.service';
import { PrismaClient, ProcessingStatus } from '@prisma/client';

export interface EventEmailJob {
  gmailMessageId: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
}

@Processor('event-email-processing', {
  concurrency: 1, // Protect SLM from overload
  limiter: {
    max: 4, // Max 4 jobs
    duration: 60000, // per minute
  }
})
export class AiProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessingProcessor.name);
  private prisma = new PrismaClient();

  constructor(
    private readonly ollamaService: OllamaService,
    private readonly eventPersistenceService: EventPersistenceService,
  ) {
    super();
  }

  async process(job: Job<EventEmailJob, any, string>): Promise<any> {
    const { gmailMessageId, body, subject, from } = job.data;
    this.logger.log(`Processing Job ${job.id} for Gmail Message: ${gmailMessageId}`);

    // Update log state
    await this.updateProcessingState(gmailMessageId, ProcessingStatus.PROCESSING);

    const startTime = Date.now();
    let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let errorMsg: string | undefined;
    let extractedEvent: any = null;

    try {
      this.logger.debug(`Extracting AI data from: ${subject}`);
      
      extractedEvent = await this.ollamaService.extractEvent(body);
      
      if (!extractedEvent || !extractedEvent.is_event) {
        status = 'FAILED';
        errorMsg = !extractedEvent ? 'Failed to extract valid JSON or validation failed.' : 'Classified by AI as a non-event email.';
        this.logger.warn(`AI extraction skipped or classified as non-event for ${gmailMessageId}`);
        await this.updateProcessingState(
          gmailMessageId, 
          !extractedEvent ? ProcessingStatus.FAILED : ProcessingStatus.IGNORED, 
          errorMsg
        );
        return; // Non-events or validation errors are NOT retried
      }

      this.logger.debug(`Extraction successful. Attempting to persist event.`);
      const savedEvent = await this.eventPersistenceService.saveExtractedEvent(extractedEvent, body);

      if (savedEvent) {
        this.logger.log(`Successfully completed Job ${job.id}. Saved Event ID: ${savedEvent.id}`);
        await this.updateProcessingState(gmailMessageId, ProcessingStatus.SUCCESS);
      } else {
        this.logger.warn(`Event persistence skipped (Possible duplicate).`);
        await this.updateProcessingState(gmailMessageId, ProcessingStatus.IGNORED, 'Skipped due to duplicate detection.');
      }
      
    } catch (error: any) {
      status = 'FAILED';
      errorMsg = error.message;
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      await this.updateProcessingState(gmailMessageId, ProcessingStatus.FAILED, error.message);
      
      // We throw to let BullMQ handle exponential backoff retries for transient errors
      throw error;
    } finally {
      const latencyMs = Date.now() - startTime;
      await this.prisma.aIObservabilityLog.create({
        data: {
          operationName: 'slm_extraction',
          latencyMs,
          status,
          errorMessage: errorMsg,
          retryCount: job.attemptsMade,
          metadata: { model: 'qwen2.5:7b', subject, from }
        }
      }).catch(err => this.logger.error('Failed to log SLM extraction telemetry:', err));
    }
  }

  private async updateProcessingState(gmailMessageId: string, status: ProcessingStatus, errorReason?: string) {
    try {
      await this.prisma.aIProcessingLog.update({
        where: { gmailMessageId },
        data: { status, errorReason }
      });
    } catch (error) {
      this.logger.error(`Failed to update processing state for ${gmailMessageId}:`, error);
    }
  }
}
