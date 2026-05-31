import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, Sse, MessageEvent } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { CopilotService, SSEMessage } from './copilot.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('copilot')
@UseGuards(FirebaseAuthGuard)
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  /**
   * GET /api/copilot/sessions
   * Retrieves all chat sessions of the authenticated user.
   */
  @Get('sessions')
  async getSessions(@Req() req: any) {
    const list = await this.copilotService.getSessions(req.user.id);
    return { sessions: list };
  }

  /**
   * POST /api/copilot/sessions
   * Creates an empty conversation chat session.
   */
  @Post('sessions')
  async createSession(
    @Req() req: any,
    @Body('title') title?: string,
  ) {
    const session = await this.copilotService.createSession(req.user.id, title);
    return { session };
  }

  /**
   * GET /api/copilot/sessions/:id
   * Retrieves message logs of a target chat session.
   */
  @Get('sessions/:id')
  async getSession(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.copilotService.getSession(req.user.id, id);
  }

  /**
   * GET /api/copilot/chat
   * Server-Sent Events (SSE) streaming endpoint.
   * EventSource calls: GET /api/copilot/chat?sessionId=xyz&message=What+is+trending?
   */
  @Sse('chat')
  chat(
    @Query('sessionId') sessionId: string,
    @Query('message') message: string,
    @Req() req: any,
  ): Observable<MessageEvent> {
    if (!sessionId || !message) {
      throw new Error('sessionId and message query parameters are required');
    }
    
    return this.copilotService.chatStream(req.user.id, sessionId, message).pipe(
      map((msg: SSEMessage) => {
        return {
          data: msg.data,
        } as MessageEvent;
      })
    );
  }
}
