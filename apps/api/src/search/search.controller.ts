import { Controller, Get, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase.guard';

@Controller('search')
@UseGuards(FirebaseAuthGuard)
export class SearchController {
  
  @Get()
  async search(@Query('query') query: string, @Query('tag') tag?: string) {
    if (!query) {
      throw new HttpException('Query parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      // Build the URL to the Python AI Worker
      const baseUrl = process.env.AI_WORKER_URL || 'http://localhost:8000';
      const aiWorkerUrl = new URL(`${baseUrl}/search`);
      aiWorkerUrl.searchParams.append('query', query);
      if (tag) {
        aiWorkerUrl.searchParams.append('tag', tag);
      }

      // Fetch the results from FastAPI
      const response = await fetch(aiWorkerUrl.toString());
      
      if (!response.ok) {
        throw new Error(`AI worker responded with status: ${response.status}`);
      }

      // Return the results directly to the client
      const data = await response.json();
      return data;
      
    } catch (error) {
      throw new HttpException(
        'Failed to fetch search results from AI worker',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
