import { Controller, Post, Body, Req, UnauthorizedException, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { Request } from 'express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('webhooks/email')
export class EmailWebhookController {
  private readonly logger = new Logger(EmailWebhookController.name);

  constructor(
    @InjectQueue('ai-event-processing') private readonly aiEventQueue: Queue
  ) {}

  @Post('inbound')
  @HttpCode(HttpStatus.OK)
  async handleInboundEmail(@Body() body: any, @Req() req: Request) {
    this.logger.log('Received inbound email webhook');
    
    // Webhook providers like SendGrid parse inbound emails into a structured JSON or multipart form
    // We will extract sender, subject, and text/html body.
    
    const sender = body.from || body.envelope?.from || body.sender;
    const subject = body.subject || '';
    const textBody = body.text || body.html || '';

    if (!sender) {
      throw new UnauthorizedException('Sender email is missing');
    }

    // Domain Whitelist Verification
    if (!sender.includes('@srmist.edu.in')) {
      this.logger.warn(`Rejected email from unauthorized domain: ${sender}`);
      return { success: false, reason: 'Unauthorized domain' };
    }

    this.logger.log(`Accepted email from ${sender}: ${subject}`);

    // Push the raw email payload to the BullMQ queue for AI processing
    await this.aiEventQueue.add('process-email', {
      sender,
      subject,
      body: textBody,
      rawPayload: body
    });

    return { success: true, message: 'Email queued for AI processing' };
  }
}

