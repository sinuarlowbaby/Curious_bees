import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GmailIngestionService implements OnModuleInit {
  private readonly logger = new Logger(GmailIngestionService.name);
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('ai-event-processing') private readonly aiEventQueue: Queue
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Gmail Ingestion polling...');
    // Poll every 15 seconds
    this.pollingInterval = setInterval(() => this.pollEmails(), 15000);
  }

  async pollEmails() {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      const credentials = await this.prisma.gmailCredentials.findUnique({
        where: { id: 'singleton' }
      });

      if (!credentials) {
        // No credentials yet, skip silently
        return;
      }

      let accessToken = credentials.accessToken;
      // If close to or past expiration (check with 60-second cushion)
      const isExpired = new Date(Date.now() + 60000) >= new Date(credentials.expiresAt);
      
      if (isExpired) {
        this.logger.log('Gmail OAuth access token close to expiration or expired. Refreshing...');
        const refreshed = await this.refreshAccessToken(credentials.refreshToken);
        if (refreshed) {
          accessToken = refreshed.accessToken;
        } else {
          this.logger.error('Failed to refresh Gmail OAuth token.');
          return;
        }
      }

      // Fetch unread messages from inbox
      const query = 'is:unread';
      const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`;
      const listRes = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!listRes.ok) {
        if (listRes.status === 401) {
          this.logger.warn('Gmail API returned 401. Refreshing token next cycle...');
          await this.prisma.gmailCredentials.update({
            where: { id: 'singleton' },
            data: { expiresAt: new Date(0) } // Force refresh next time
          });
        } else {
          this.logger.error(`Failed to list messages: ${listRes.statusText}`);
        }
        return;
      }

      const listData: any = await listRes.json();
      const messages = listData.messages || [];

      if (messages.length === 0) {
        return;
      }

      this.logger.log(`Found ${messages.length} unread emails to process.`);

      for (const msgInfo of messages) {
        try {
          await this.processMessage(msgInfo.id, accessToken);
        } catch (e: any) {
          this.logger.error(`Error processing Gmail message ${msgInfo.id}: ${e.message}`);
        }
      }

    } catch (error: any) {
      this.logger.error(`Gmail polling failed: ${error.message}`);
    } finally {
      this.isPolling = false;
    }
  }

  private async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string } | null> {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      this.logger.error('GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET is missing from environment.');
      return null;
    }

    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!res.ok) {
        this.logger.error(`Failed to refresh token: ${res.statusText}`);
        return null;
      }

      const data: any = await res.json();
      const newAccessToken = data.access_token;
      const expiresIn = data.expires_in || 3600;
      const newExpiresAt = new Date(Date.now() + expiresIn * 1000);

      await this.prisma.gmailCredentials.upsert({
        where: { id: 'singleton' },
        create: {
          id: 'singleton',
          accessToken: newAccessToken,
          refreshToken: refreshToken,
          expiresAt: newExpiresAt
        },
        update: {
          accessToken: newAccessToken,
          expiresAt: newExpiresAt
        }
      });

      this.logger.log('Gmail OAuth access token successfully refreshed.');
      return { accessToken: newAccessToken };

    } catch (e: any) {
      this.logger.error(`Token refresh HTTP request failed: ${e.message}`);
      return null;
    }
  }

  private async processMessage(messageId: string, accessToken: string) {
    const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`;
    const res = await fetch(messageUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch message details: ${res.statusText}`);
    }

    const message: any = await res.json();
    const headers = message.payload.headers || [];

    const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
    const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '';

    const emailRegex = /<([^>]+)>/;
    const match = fromHeader.match(emailRegex);
    const senderEmail = match ? match[1] : fromHeader.trim();

    this.logger.log(`Processing unread email from: ${senderEmail}, Subject: "${subjectHeader}"`);

    let bodyText = this.parseEmailBody(message.payload);

    const attachments = this.parseAttachments(message.payload);
    if (attachments.length > 0) {
      bodyText += '\n\n[Email Attachments Included]:\n';
      attachments.forEach(att => {
        bodyText += `- ${att.filename} (${att.mimeType}, size: ${att.size} bytes)\n`;
      });
    }

    const isDevMode = process.env.NODE_ENV !== 'production';

    // 1. Filtering Layer
    let shouldProcess = true;
    let filterReason = '';

    if (isDevMode) {
      if (senderEmail.toLowerCase() !== 'r.matheshwaran.io@gmail.com' || !subjectHeader.startsWith('EVENT:')) {
        shouldProcess = false;
        filterReason = 'Filtered by Dev Mode rules';
      }
    } else {
      const eventKeywords = /workshop|seminar|symposium|conference|webinar|hackathon|fdp|lecture|event/i;
      const dateHeuristic = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|monday|tuesday|wednesday|thursday|friday|saturday|sunday|202[4-9]|\d{1,2}\/\d{1,2})/i;
      const timeHeuristic = /(\d{1,2}:\d{2}|\d{1,2}\s?(am|pm|a\.m\.|p\.m\.))/i;

      const combinedText = subjectHeader + ' ' + bodyText;
      const hasEventKeyword = eventKeywords.test(combinedText);
      const hasDateOrTime = dateHeuristic.test(combinedText) || timeHeuristic.test(combinedText);

      if (!hasEventKeyword || !hasDateOrTime) {
        shouldProcess = false;
        filterReason = 'Filtered by Regex Heuristics (No Event Keywords or Time/Date)';
      }
    }

    if (!shouldProcess) {
      this.logger.log(`Ignoring email from ${senderEmail}: ${filterReason}`);
      await this.prisma.aIProcessingLog.create({
        data: {
          senderEmail,
          subject: subjectHeader,
          rawEmailBody: bodyText,
          status: 'IGNORED',
          errorReason: filterReason
        }
      });
    } else {
      // Create QUEUED log entry
      const logEntry = await this.prisma.aIProcessingLog.create({
        data: {
          senderEmail,
          subject: subjectHeader,
          rawEmailBody: bodyText,
          status: 'QUEUED'
        }
      });

      // Queue email for AI Processing!
      await this.aiEventQueue.add('process-email', {
        logId: logEntry.id,
        sender: senderEmail,
        subject: subjectHeader,
        body: bodyText
      });
    }

    // Mark as read (remove UNREAD label)
    const modifyUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`;
    const modifyRes = await fetch(modifyUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        removeLabelIds: ['UNREAD']
      })
    });

    if (!modifyRes.ok) {
      this.logger.error(`Failed to mark email ${messageId} as read: ${modifyRes.statusText}`);
    } else {
      this.logger.log(`Successfully marked email ${messageId} as read.`);
    }
  }

  private parseEmailBody(part: any): string {
    if (!part) return '';

    if (part.mimeType === 'text/plain' && part.body && part.body.data) {
      return this.decodeBase64(part.body.data);
    }

    if (part.mimeType === 'text/html' && part.body && part.body.data) {
      return this.decodeBase64(part.body.data);
    }

    if (part.parts && part.parts.length > 0) {
      let combined = '';
      const plainParts = part.parts.filter((p: any) => p.mimeType === 'text/plain');
      if (plainParts.length > 0) {
        for (const p of plainParts) {
          combined += this.parseEmailBody(p);
        }
      } else {
        for (const p of part.parts) {
          combined += this.parseEmailBody(p);
        }
      }
      return combined;
    }

    return '';
  }

  private parseAttachments(part: any): any[] {
    const list: any[] = [];
    if (!part) return list;

    if (part.filename && part.body && part.body.attachmentId) {
      list.push({
        filename: part.filename,
        mimeType: part.mimeType,
        attachmentId: part.body.attachmentId,
        size: part.body.size
      });
    }

    if (part.parts && part.parts.length > 0) {
      for (const p of part.parts) {
        list.push(...this.parseAttachments(p));
      }
    }

    return list;
  }

  private decodeBase64(data: string): string {
    const sanitized = data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(sanitized, 'base64').toString('utf8');
  }
}
