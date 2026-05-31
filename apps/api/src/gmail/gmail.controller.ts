import { Controller, Get, Post, Delete, Query, Redirect, Res, UseGuards, Body } from '@nestjs/common';
import { GmailOauthService } from './gmail-oauth.service';
import { GmailIngestionService } from './gmail-ingestion.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('events/gmail')
export class GmailController {
  constructor(
    private readonly gmailOauthService: GmailOauthService,
    private readonly gmailIngestionService: GmailIngestionService,
    private readonly prisma: PrismaService,
    @InjectQueue('event-email-processing') private readonly emailQueue: Queue,
  ) {}

  /**
   * Redirects user directly to Google Consent Screen
   */
  @Get('auth-url')
  @Redirect()
  getAuthUrl() {
    const url = this.gmailOauthService.getAuthUrl();
    return { url, statusCode: 302 };
  }

  /**
   * Google OAuth Callback Endpoint
   */
  @Get('callback')
  @Redirect()
  async handleCallback(@Query('code') code: string) {
    try {
      if (!code) {
        throw new Error('No authorization code provided from Google.');
      }
      await this.gmailOauthService.handleCallback(code);
      return { url: 'http://localhost:3000/events?gmail_linked=success', statusCode: 302 };
    } catch (error) {
      return { url: 'http://localhost:3000/events?gmail_linked=error', statusCode: 302 };
    }
  }

  /**
   * Guarded Status Endpoint
   */
  @Get('status')
  @UseGuards(FirebaseAuthGuard)
  async getStatus() {
    return {
      isLinked: this.gmailOauthService.isAuthenticated(),
    };
  }

  /**
   * Disconnects the Gmail integration
   */
  @Delete('disconnect')
  @UseGuards(FirebaseAuthGuard)
  async disconnect() {
    await this.prisma.gmailCredentials.deleteMany({
      where: { id: 'singleton' },
    });
    // Force reset local auth status
    await this.gmailOauthService.initializeCredentials();
    return { success: true };
  }

  /**
   * Simulates/mocks an incoming academic email for processing
   */
  @Post('mock')
  @UseGuards(FirebaseAuthGuard)
  async simulateEmail(
    @Body() body: { sender: string; subject: string; body: string }
  ) {
    const messageId = `mock-${Date.now()}`;
    const normalizedBody = body.body.replace(/\r\n/g, '\n').trim();

    // Create queue processing log
    await this.prisma.aIProcessingLog.create({
      data: {
        gmailMessageId: messageId,
        senderEmail: body.sender,
        subject: body.subject,
        rawEmailBody: normalizedBody,
        status: 'QUEUED',
      },
    });

    // Enqueue BullMQ job
    await this.emailQueue.add(
      'process-email',
      {
        gmailMessageId: messageId,
        from: body.sender,
        subject: body.subject,
        body: normalizedBody,
        receivedAt: new Date().toISOString(),
      },
      {
        jobId: messageId,
      },
    );

    return { success: true, messageId };
  }

  /**
   * Triggers a manual sync/fetch of unread emails from the connected Gmail inbox.
   */
  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  async syncEmails() {
    await this.gmailIngestionService.ingestUnreadEmails();
    return { success: true };
  }
}
