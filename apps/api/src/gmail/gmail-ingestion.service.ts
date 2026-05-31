import { Injectable, Logger } from '@nestjs/common';
import { GmailOauthService } from './gmail-oauth.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaClient, ProcessingStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class GmailIngestionService {
  private readonly logger = new Logger(GmailIngestionService.name);
  private prisma = new PrismaClient();
  
  // Hardcoded development safety rules
  private readonly ALLOWED_SENDER = 'r.matheshwaran.io@gmail.com';
  private readonly SUBJECT_PREFIX = 'EVENT:';

  constructor(
    private readonly gmailOauthService: GmailOauthService,
    @InjectQueue('event-email-processing') private readonly emailQueue: Queue,
  ) {}

  @Cron('*/15 * * * * *') // Run every 15 seconds!
  async handleCron() {
    if (this.gmailOauthService.isAuthenticated()) {
      this.logger.debug('Triggering scheduled Gmail ingestion poll...');
      await this.ingestUnreadEmails();
    }
  }

  /**
   * Fetches unread emails from Gmail, applies safety filters, and pushes to BullMQ.
   * Can be triggered by a Cron job or manually.
   */
  async ingestUnreadEmails() {
    if (!this.gmailOauthService.isAuthenticated()) {
      this.logger.warn('Gmail OAuth is not authenticated. Skipping ingestion.');
      return;
    }

    const gmail = this.gmailOauthService.getGmailClient();

    try {
      this.logger.debug('Fetching unread emails from Gmail inbox...');
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 20, // process in small batches
      });

      const messages = response.data.messages || [];
      if (messages.length === 0) {
        this.logger.debug('No unread emails found.');
        return;
      }

      this.logger.log(`Found ${messages.length} unread emails. Processing filters...`);

      for (const msg of messages) {
        if (!msg.id) continue;
        await this.processMessage(msg.id, gmail);
      }
    } catch (error: any) {
      this.logger.error(`Failed to ingest emails: ${error.message}`);
    }
  }

  private async processMessage(messageId: string, gmail: any) {
    try {
      // Check if we already processed this message ID to prevent duplicates
      const existingLog = await this.prisma.aIProcessingLog.findUnique({
        where: { gmailMessageId: messageId }
      });

      if (existingLog) {
        this.logger.debug(`Message ${messageId} already exists in processing log. Skipping.`);
        // Ensure it's marked as read so it doesn't get picked up again
        await this.markAsRead(messageId, gmail);
        return;
      }

      const msgResponse = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      const payload = msgResponse.data.payload;
      const headers = payload.headers;

      const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '';
      const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';

      // Extract raw email address if in format "Name <email@domain.com>"
      const rawFrom = fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader;

      // We no longer require the subject to start with EVENT: or restrict the sender.
      // Every unread email is ingested. The AI (Qwen) dynamically classifies if it is a structured campus event or not.
      this.logger.debug(`Ingesting unread message ${messageId} (From: ${rawFrom}, Subject: ${subjectHeader})`);

      // STEP 2: Extract Body Plaintext
      const bodyText = this.extractBodyText(payload);
      const normalizedBody = this.normalizeWhitespace(bodyText);

      // STEP 3: Create Processing Log
      await this.prisma.aIProcessingLog.create({
        data: {
          gmailMessageId: messageId,
          senderEmail: rawFrom,
          subject: subjectHeader,
          rawEmailBody: normalizedBody,
          status: ProcessingStatus.QUEUED,
        }
      });

      // STEP 4: Push to BullMQ
      await this.emailQueue.add('process-email', {
        gmailMessageId: messageId,
        from: rawFrom,
        subject: subjectHeader,
        body: normalizedBody,
        receivedAt: new Date().toISOString()
      }, {
        jobId: messageId, // Ensures BullMQ also protects against duplicates
      });

      this.logger.log(`Queued message ${messageId} for AI Processing.`);
      
      // STEP 5: Mark as Read
      await this.markAsRead(messageId, gmail);

    } catch (error: any) {
      this.logger.error(`Error processing message ${messageId}: ${error.message}`);
    }
  }

  /**
   * Helper to mark a Gmail message as read (removes UNREAD label).
   */
  private async markAsRead(messageId: string, gmail: any) {
    try {
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
    } catch (error: any) {
      this.logger.error(`Failed to mark message ${messageId} as read: ${error.message}`);
    }
  }

  /**
   * Deep extraction of plaintext from Gmail payload parts.
   */
  private extractBodyText(payload: any): string {
    let body = '';
    
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          body += this.extractBodyText(part); // Recursively search inside multipart
        }
      }
    } else if (payload.body?.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    return body;
  }

  /**
   * Cleans up messy email whitespace for the SLM.
   */
  private normalizeWhitespace(text: string): string {
    return text
      .replace(/\\r\\n/g, '\\n')
      .replace(/\\n{3,}/g, '\\n\\n') // Collapse excessive newlines
      .trim();
  }
}
