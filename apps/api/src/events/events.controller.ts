import { Controller, Get, Post, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('events')
@UseGuards(AuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async getEvents() {
    return this.eventsService.getEvents();
  }

  @Post()
  async createEvent(
    @Body() body: { event: string; date: string; time: string; venue: string }
  ) {
    return this.eventsService.createEvent(body);
  }

  @Put()
  async updateEvent(
    @Body() body: { id: string; event: string; date: string; time: string; venue: string }
  ) {
    return this.eventsService.updateEvent(body);
  }

  @Delete()
  async deleteEvent(@Body() body: { id: string }) {
    return this.eventsService.deleteEvent(body.id);
  }
}
