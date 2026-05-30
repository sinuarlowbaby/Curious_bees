import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AiExtractionService } from '../events/ai-extraction.service';
import { EventValidationService } from '../events/event-validation.service';
import { PrismaService } from '../prisma/prisma.service';
import { InterestMatcherService } from '../notifications/interest-matcher.service';
import { NotificationsService } from '../notifications/notifications.service';

@Processor('ai-event-processing', {
  limiter: {
    max: 4,
    duration: 60000,
  }
})
export class EventsProcessor extends WorkerHost {
  private readonly logger = new Logger(EventsProcessor.name);

  constructor(
    private readonly aiExtractionService: AiExtractionService,
    private readonly validationService: EventValidationService,
    private readonly prisma: PrismaService,
    private readonly matcherService: InterestMatcherService,
    private readonly notificationsService: NotificationsService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}...`);

    if (job.name === 'process-email') {
      const { logId, sender, subject, body } = job.data;

      try {
        if (logId) {
          await this.prisma.aIProcessingLog.update({
            where: { id: logId },
            data: { status: 'AI_PROCESSING' }
          });
        }

        const extractedData = await this.aiExtractionService.extractEventData(subject, body);
        
        // Calculate a realistic AI confidence score based on the successfully extracted fields
        let confidenceScore = 75;
        if (extractedData.title) confidenceScore += 5;
        if (extractedData.venue) confidenceScore += 5;
        if (extractedData.date) confidenceScore += 5;
        if (extractedData.time) confidenceScore += 5;
        if (extractedData.department) confidenceScore += 3;
        if (extractedData.category) confidenceScore += 3;
        if (extractedData.description && extractedData.description.length > 20) confidenceScore += 3;
        
        confidenceScore = Math.min(confidenceScore, 99);

        if (logId) {
          await this.prisma.aIProcessingLog.update({
            where: { id: logId },
            data: { 
              extractedJson: extractedData as any,
              confidenceScore: confidenceScore,
              status: 'EXTRACTED'
            }
          });
        }

        const validationResult = await this.validationService.validateEvent(extractedData);
        if (!validationResult.isValid) {
          this.logger.warn(`Event validation failed: ${validationResult.reason}`);
          if (logId) {
            await this.prisma.aIProcessingLog.update({
              where: { id: logId },
              data: { status: 'FAILED', errorReason: validationResult.reason }
            });
          }
          
          return;
        }

        // Duplicate Check
        const existingEvent = await this.prisma.event.findFirst({
          where: {
            title: extractedData.title,
            date: new Date(extractedData.date),
          }
        });

        if (existingEvent) {
          this.logger.warn(`Duplicate event detected: ${extractedData.title}. Skipping creation.`);
          if (logId) {
            await this.prisma.aIProcessingLog.update({
              where: { id: logId },
              data: { status: 'IGNORED', errorReason: 'Duplicate event detected.' }
            });
          }
          return;
        }

        const newEvent = await this.prisma.event.create({
          data: {
            title: extractedData.title,
            description: extractedData.description,
            department: extractedData.department,
            venue: extractedData.venue,
            date: new Date(extractedData.date),
            time: extractedData.time,
            category: extractedData.category,
            organizerEmail: extractedData.organizerEmail || sender,
            registrationLink: extractedData.registrationLink,
            tags: extractedData.tags,
            createdByAi: true,
            approvalStatus: confidenceScore >= 85 ? 'PUBLISHED' : 'PENDING'
          }
        });

        this.logger.log(`Successfully created new event: ${newEvent.title}`);

        if (logId) {
          await this.prisma.aIProcessingLog.update({
            where: { id: logId },
            data: { status: 'SUCCESS' }
          });
        }

        // 5. Trigger Smart Notifications
        const matchedUsers = await this.matcherService.findMatchingUsers(newEvent);
        await this.notificationsService.sendEventNotifications(matchedUsers, newEvent);

        return newEvent;

      } catch (error: any) {
        this.logger.error(`Failed to process email job ${job.id}: ${error.message}`, error.stack);
        throw error; // Let BullMQ handle retries
      }
    }
  }
}
