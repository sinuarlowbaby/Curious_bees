import { Controller, Get, Post, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';

@Controller('events')
@UseGuards(FirebaseAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getEvents() {
    return this.eventsService.getEvents();
  }

  @Get('ai-logs')
  async getAiLogs() {
    return this.eventsService.getAiLogs();
  }

  @Post()
  async createEvent(
    @Body() body: { title: string; date: string; time: string; venue: string; description?: string }
  ) {
    return this.eventsService.createEvent(body);
  }

  @Put()
  async updateEvent(
    @Body() body: { id: string; title: string; date: string; time: string; venue: string }
  ) {
    return this.eventsService.updateEvent(body);
  }

  @Delete()
  async deleteEvent(@Body() body: { id: string }) {
    return this.eventsService.deleteEvent(body.id);
  }
}
