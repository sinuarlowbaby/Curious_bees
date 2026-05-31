import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { EventStatus, Prisma } from '@prisma/client';
import { SearchService } from '../search/search.service';

@Controller('events')
@UseGuards(FirebaseAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly searchService: SearchService,
  ) {}

  @Get()
  async getEvents(
    @Query('status') status?: EventStatus,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string
  ) {
    return this.eventsService.getEvents({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
    });
  }

  @Get('review')
  async getReviewEvents() {
    return this.eventsService.getReviewEvents();
  }

  @Get('stats')
  async getPipelineStats() {
    return this.eventsService.getPipelineStats();
  }

  @Get(':id')
  async getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @Get(':id/related')
  async getRelatedEvents(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.getRelatedEvents(id, limit ? parseInt(limit) : 5);
  }

  @Post()
  async createEvent(
    @Body() body: { title: string; date: string; time: string; venue: string; description?: string }
  ) {
    return this.eventsService.createEvent(body);
  }

  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() body: Prisma.EventUpdateInput
  ) {
    return this.eventsService.updateEvent(id, body);
  }

  @Patch(':id/status')
  async updateEventStatus(
    @Param('id') id: string,
    @Body() body: { status: EventStatus }
  ) {
    return this.eventsService.updateEventStatus(id, body.status);
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }
}
