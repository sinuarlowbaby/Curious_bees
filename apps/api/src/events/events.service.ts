import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private prisma: PrismaService) {}

  async getEvents() {
    try {
      return await this.prisma.event.findMany({
        where: { approvalStatus: 'PUBLISHED' },
        orderBy: { date: 'asc' }
      });
    } catch (e: any) {
      this.logger.warn('Failed to query database events. Returning fallback mock data.');
      return [];
    }
  }

  async getAiLogs() {
    return await this.prisma.aIProcessingLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' }
    });
  }

  async createEvent(input: { title: string; date: string; time: string; venue: string; description?: string }) {
    const { title, date, time, venue, description } = input;
    if (!title || !date || !time || !venue) {
      throw new BadRequestException('Event details are incomplete.');
    }

    try {
      return await this.prisma.event.create({
        data: { 
          title, 
          date: new Date(date), 
          time, 
          venue, 
          description,
          createdByAi: false 
        }
      });
    } catch (e) {
      this.logger.error('Failed to create event', e);
      throw new BadRequestException('Could not create event');
    }
  }

  async updateEvent(input: { id: string; title: string; date: string; time: string; venue: string }) {
    const { id, title, date, time, venue } = input;
    if (!id) {
      throw new BadRequestException('Event identifier is required.');
    }

    try {
      return await this.prisma.event.update({
        where: { id },
        data: { title, date: new Date(date), time, venue }
      });
    } catch (e) {
      throw new NotFoundException('Event not found.');
    }
  }

  async deleteEvent(id: string) {
    if (!id) {
      throw new BadRequestException('Event identifier is required.');
    }

    try {
      return await this.prisma.event.delete({
        where: { id }
      });
    } catch (e) {
      throw new NotFoundException('Event not found.');
    }
  }
}
