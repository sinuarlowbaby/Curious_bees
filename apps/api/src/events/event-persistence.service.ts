import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaClient, EventStatus, Event as PrismaEvent } from '@prisma/client';
import { z } from 'zod';
import { EventSchema } from '../ai/event.schema';
import { NotificationsService } from '../notifications/notifications.service';

type ExtractedEvent = z.infer<typeof EventSchema>;

@Injectable()
export class EventPersistenceService {
  private readonly logger = new Logger(EventPersistenceService.name);
  private prisma = new PrismaClient();

  constructor(
    @InjectQueue('event-embedding-generation') private embeddingQueue: Queue,
    private readonly notificationsService: NotificationsService
  ) {}

  private determineStatus(confidence: number): EventStatus {
    if (confidence >= 0.90) return EventStatus.PUBLISHED;
    if (confidence >= 0.70) return EventStatus.REVIEW_REQUIRED;
    return EventStatus.FAILED;
  }

  async saveExtractedEvent(
    eventData: ExtractedEvent,
    rawEmail: string,
    aiModel: string = 'qwen2.5:7b',
    aiProvider: string = 'ollama'
  ): Promise<PrismaEvent | null> {
    try {
      this.logger.debug(`Persisting AI event: ${eventData.title}`);
      const eventDate = this.parseDateSafely(eventData.date || '');

      const existingEvent = await this.prisma.event.findFirst({
        where: { title: eventData.title || '', date: eventDate, venue: eventData.venue || '' },
      });
      if (existingEvent) {
        this.logger.warn(`Duplicate event: ${eventData.title}. Skipping.`);
        return null;
      }

      const status = this.determineStatus(eventData.confidence || 0);

      const newEvent = await this.prisma.event.create({
        data: {
          title: eventData.title || 'Untitled Campus Event',
          eventType: eventData.event_type || 'Seminar',
          speaker: eventData.speaker,
          department: eventData.department,
          date: eventDate,
          time: eventData.time || 'TBA',
          venue: eventData.venue || 'SRMIST Campus',
          topic: eventData.topic,
          organizerEmail: eventData.organizer_email,
          confidence: eventData.confidence || 0.8,
          aiModel,
          aiProvider,
          rawEmail,
          status,
          tags: eventData.tags || [],
          priority: eventData.priority || 'MEDIUM',
        },
      });

      this.logger.log(`Persisted Event ${newEvent.id} [${newEvent.status}]`);

      // If automatically published, route notifications immediately to interested users!
      if (newEvent.status === EventStatus.PUBLISHED) {
        this.notificationsService.routeEvent(newEvent).catch(e => {
          this.logger.error(`Failed to route auto-published event ${newEvent.id}: ${e.message}`);
        });
      }

      // Fire-and-forget: enqueue embedding generation — never blocks ingestion
      this.embeddingQueue.add(
        'generate-event-embedding',
        {
          eventId: newEvent.id,
          title: newEvent.title,
          eventType: newEvent.eventType,
          topic: newEvent.topic,
          tags: newEvent.tags,
          department: newEvent.department,
          venue: newEvent.venue,
          description: newEvent.description,
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: true,
          removeOnFail: false,
        }
      ).catch(e => this.logger.error(`Embedding enqueue failed: ${e.message}`));

      return newEvent;
    } catch (error: any) {
      this.logger.error(`Failed to persist event: ${error.message}`);
      return null;
    }
  }

  /**
   * Parses typical human date patterns (DD-MM-YYYY, YYYY-MM-DD, standard JS) robustly without crashing.
   */
  private parseDateSafely(dateStr: string): Date {
    try {
      if (!dateStr) return new Date();

      // Clean the string, strip ordinals (e.g. 27th -> 27)
      let cleaned = dateStr.trim().replace(/(\d+)(st|nd|rd|th)/gi, '$1');

      // 1. Try standard JS Date constructor first
      const d = new Date(cleaned);
      if (!isNaN(d.getTime())) return d;

      // 2. Try parsing DD-MM-YYYY, DD/MM/YYYY, or DD.MM.YYYY
      const parts = cleaned.split(/[-/.]/);
      if (parts.length === 3) {
        // Extract only the numeric digits for each part to strip trailing labels like "(Saturday)"
        const p0Raw = parts[0].replace(/\D/g, '');
        const p1Raw = parts[1].replace(/\D/g, '');
        const p2Raw = parts[2].replace(/\D/g, '');

        if (p0Raw && p1Raw && p2Raw) {
          // If the first part has length 4, assume YYYY-MM-DD
          if (p0Raw.length === 4) {
            const year = parseInt(p0Raw, 10);
            const month = parseInt(p1Raw, 10) - 1;
            const day = parseInt(p2Raw, 10);
            const customDate = new Date(year, month, day);
            if (!isNaN(customDate.getTime())) return customDate;
          } else {
            // Assume DD-MM-YYYY or MM-DD-YYYY. In academic/Indian context, default is DD-MM-YYYY.
            const day = parseInt(p0Raw, 10);
            const month = parseInt(p1Raw, 10) - 1;
            const year = parseInt(p2Raw, 10);
            const customDate = new Date(year, month, day);
            if (!isNaN(customDate.getTime())) return customDate;
          }
        }
      }
    } catch (e: any) {
      this.logger.error(`Failed to parse custom date format: ${dateStr}. Error: ${e.message}`);
    }

    // Default fallback if parsing fails: return current date
    return new Date();
  }
}
