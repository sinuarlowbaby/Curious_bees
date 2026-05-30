import { Controller, Get, Post, Body, Query, Res, Logger, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('events/gmail')
export class GmailOauthController {
  private readonly logger = new Logger(GmailOauthController.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('ai-event-processing') private readonly aiEventQueue: Queue
  ) {}

  @Get('auth-url')
  getAuthUrl(@Res() res: Response) {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const redirectUri = process.env.GMAIL_REDIRECT_URI || 'http://localhost:4000/api/events/gmail/callback';

    if (!clientId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'GMAIL_CLIENT_ID is not configured in the environment. Please add it to apps/web/.env first.',
      });
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.modify')}` +
      `&access_type=offline` +
      `&prompt=consent`;

    this.logger.log(`Generated OAuth authorization URL: ${authUrl}`);
    
    // Direct redirect or return JSON
    return res.redirect(authUrl);
  }

  @Get('callback')
  async handleCallback(@Query('code') code: string, @Query('error') error: string, @Res() res: Response) {
    if (error) {
      this.logger.error(`Gmail OAuth returned error: ${error}`);
      return res.status(HttpStatus.BAD_REQUEST).send(this.renderFeedbackHtml(false, `OAuth Error: ${error}`));
    }

    if (!code) {
      return res.status(HttpStatus.BAD_REQUEST).send(this.renderFeedbackHtml(false, 'Authorization code is missing.'));
    }

    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const redirectUri = process.env.GMAIL_REDIRECT_URI || 'http://localhost:4000/api/events/gmail/callback';

    if (!clientId || !clientSecret) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(
        this.renderFeedbackHtml(false, 'GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET is not configured in the environment.')
      );
    }

    try {
      this.logger.log('Exchanging auth code for tokens...');
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.statusText} - ${errorText}`);
      }

      const tokens: any = await response.json();
      const accessToken = tokens.access_token;
      const refreshToken = tokens.refresh_token; // Offline access yields this on the first consent
      const expiresIn = tokens.expires_in || 3600;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      if (!refreshToken) {
        // If refresh token is missing (already consented earlier), see if we have one stored
        const existing = await this.prisma.gmailCredentials.findUnique({ where: { id: 'singleton' } });
        if (!existing?.refreshToken) {
          throw new Error(
            'Failed to retrieve Refresh Token. Please go to Google Account Settings -> Security -> Third-party apps -> Remove ReCollab access, and try signing in again to force Google to issue a new refresh token.'
          );
        }
        
        await this.prisma.gmailCredentials.upsert({
          where: { id: 'singleton' },
          create: {
            id: 'singleton',
            accessToken,
            refreshToken: existing.refreshToken,
            expiresAt
          },
          update: {
            accessToken,
            expiresAt
          }
        });
      } else {
        await this.prisma.gmailCredentials.upsert({
          where: { id: 'singleton' },
          create: {
            id: 'singleton',
            accessToken,
            refreshToken,
            expiresAt
          },
          update: {
            accessToken,
            refreshToken,
            expiresAt
          }
        });
      }

      this.logger.log('Gmail account successfully linked through Google OAuth 2.0.');
      return res.status(HttpStatus.OK).send(this.renderFeedbackHtml(true, 'Gmail Account Connected Successfully!'));

    } catch (e: any) {
      this.logger.error(`OAuth callback error: ${e.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(this.renderFeedbackHtml(false, e.message));
    }
  }

  @Post('mock')
  async triggerMockEmail(
    @Body() body: { sender: string; subject: string; body: string }
  ) {
    const sender = body.sender || 'r.matheshwaran.io@gmail.com';
    const subject = body.subject || 'Research Seminar: Neural Radiance Fields';
    const emailBody = body.body || 'We are organizing a seminar on Neural Radiance Fields on June 15 at 02:00 PM at PG Seminar Hall, CS Department.';

    this.logger.log(`Triggering mock email from ${sender}: "${subject}"`);

    // Create a mock log entry
    const logEntry = await this.prisma.aIProcessingLog.create({
      data: {
        senderEmail: sender,
        subject,
        rawEmailBody: emailBody,
        status: 'QUEUED'
      }
    });

    // Queue the mock email payload immediately
    await this.aiEventQueue.add('process-email', {
      logId: logEntry.id,
      sender,
      subject,
      body: emailBody
    });

    return {
      success: true,
      message: 'Mock email successfully queued for AI processing.',
      details: { sender, subject, body: emailBody }
    };
  }

  private renderFeedbackHtml(success: boolean, message: string): string {
    const primaryColor = success ? '#d4af37' : '#e11d48'; // Gold vs Crimson
    const title = success ? 'Connection Succeeded' : 'Connection Failed';
    const details = success 
      ? 'SRM ReCollab AI Ingestion has successfully established read-only access to your Gmail. Incoming event emails will now be automatically parsed, validated, and pushed onto the master campus calendar.'
      : 'We were unable to authenticate your Google Workspace / Gmail account. Please verify that your Client ID, Secret, and Redirect URIs match your Google Cloud Console configuration.';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gmail Integration Status | ReCollab</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;800;900&family=Space+Mono&display=swap" rel="stylesheet">
        <style>
          body {
            background-color: #030712;
            color: #f3f4f6;
            font-family: 'Outfit', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
            text-align: center;
          }
          .glass-panel {
            background: rgba(17, 24, 39, 0.6);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 28px;
            padding: 3rem 2rem;
            max-width: 480px;
            width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            position: relative;
          }
          .glow-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 150%;
            height: 150%;
            background: radial-gradient(circle, ${primaryColor}08 0%, transparent 70%);
            z-index: -1;
            pointer-events: none;
          }
          .icon-wrapper {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: ${success ? 'rgba(212, 175, 55, 0.1)' : 'rgba(225, 29, 72, 0.1)'};
            border: 2px solid ${primaryColor};
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
          }
          .icon {
            font-size: 2.2rem;
            line-height: 1;
          }
          h1 {
            font-size: 1.8rem;
            font-weight: 900;
            margin: 0 0 1rem;
            letter-spacing: -0.025em;
            color: #ffffff;
            text-transform: uppercase;
          }
          p.details {
            font-size: 0.95rem;
            color: #9ca3af;
            line-height: 1.6;
            margin-bottom: 2rem;
            font-weight: 500;
          }
          .error-box {
            background: rgba(225, 29, 72, 0.05);
            border: 1px dashed rgba(225, 29, 72, 0.3);
            border-radius: 12px;
            padding: 1rem;
            font-family: 'Space Mono', monospace;
            font-size: 0.8rem;
            color: #fda4af;
            margin-bottom: 2rem;
            word-break: break-all;
          }
          .badge {
            display: inline-block;
            background: ${primaryColor};
            color: ${success ? '#000000' : '#ffffff'};
            font-size: 0.75rem;
            font-weight: 800;
            padding: 0.4rem 1rem;
            border-radius: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1.5rem;
          }
          .footer {
            font-size: 0.8rem;
            color: #6b7280;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="glass-panel">
          <div class="glow-ring"></div>
          <div class="badge">${title}</div>
          <div class="icon-wrapper">
            <span class="icon">${success ? '⚡' : '⚠️'}</span>
          </div>
          <h1>${success ? 'OAuth Connected' : 'Authorization Failed'}</h1>
          <p class="details">${details}</p>
          ${!success ? `<div class="error-box">${message}</div>` : ''}
          <div class="footer">ReCollab Multi-Agent Ingestion Pipeline</div>
        </div>
      </body>
      </html>
    `;
  }
}
