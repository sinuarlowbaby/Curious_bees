import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExtractedEventData } from './ai-extraction.service';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

@Injectable()
export class EventValidationService {
  private readonly logger = new Logger(EventValidationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates the extracted AI event data against business rules:
   * 1. Missing required fields
   * 2. Venue conflicts (same venue, same day)
   */
  async validateEvent(data: ExtractedEventData): Promise<ValidationResult> {
    this.logger.log(`Validating event: ${data.title}`);

    // 1. Check for missing required fields
    if (!data.title || !data.venue || !data.date || !data.time) {
      return {
        isValid: false,
        reason: 'Missing required fields (title, venue, date, or time). Please reply with the complete details.'
      };
    }

    // 2. Check for venue conflicts (Duplicate events on the same date/venue)
    try {
      const eventDate = new Date(data.date);
      // Prisma expects standard ISO dates for DateTime comparisons
      
      const existingEvents = await this.prisma.event.findMany({
        where: {
          venue: { equals: data.venue, mode: 'insensitive' },
          date: {
            gte: new Date(eventDate.setHours(0, 0, 0, 0)),
            lt: new Date(eventDate.setHours(23, 59, 59, 999))
          }
        }
      });

      if (existingEvents.length > 0) {
        // If there's an event at the same venue on the same day, it's a conflict
        // (In a more advanced setup, we would parse time intervals and check overlap)
        return {
          isValid: false,
          reason: `Venue Conflict: The venue "${data.venue}" is already booked on ${data.date}. Please choose a different venue or date.`
        };
      }
    } catch (e) {
      this.logger.warn(`Failed to parse date for conflict validation: ${data.date}`);
      return {
        isValid: false,
        reason: 'Invalid date format provided.'
      };
    }

    return { isValid: true };
  }
}
