import { Controller, Get, Post, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ThreadsService } from './threads.service';
import { CreateThreadInput } from '@srm-recollab/types';

@Controller('threads')
@UseGuards(AuthGuard)
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get()
  async getThreads(@Query('search') search?: string, @Query('tag') tag?: string) {
    return this.threadsService.getThreads(search, tag);
  }

  @Get(':id')
  async getThreadById(@Param('id') id: string) {
    return this.threadsService.getThreadById(id);
  }

  @Post()
  async createThread(@Req() req: any, @Body() body: CreateThreadInput) {
    return this.threadsService.createThread(req.user.id, body);
  }
}
