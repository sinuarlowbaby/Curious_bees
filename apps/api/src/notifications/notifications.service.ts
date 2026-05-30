import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Registers a unique FCM token to a User
   */
  async registerToken(userId: string, token: string) {
    if (!token) {
      throw new BadRequestException('FCM registration token is required.');
    }

    try {
      // Upsert: Save or update the active device token to the database
      return await this.prisma.deviceToken.upsert({
        where: { token },
        update: { userId },
        create: { token, userId }
      });
    } catch (e: any) {
      this.logger.error(`❌ Failed to register FCM token: ${e.message}`);
      throw new BadRequestException('Failed to save device registration token.');
    }
  }

  /**
   * Dispatches a push notification to all active devices of a target User
   */
  async sendPushToUser(userId: string, payload: { title: string; body: string; url?: string }) {
    try {
      // 1. Fetch all registered device tokens for the user
      const devices = await this.prisma.deviceToken.findMany({
        where: { userId }
      });

      if (devices.length === 0) {
        this.logger.log(`ℹ️ User ${userId} has 0 registered device tokens. Skipping push.`);
        return;
      }

      const tokens = devices.map(d => d.token);

      // 2. Build multi-cast notification payload
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          ...(payload.url && { url: payload.url })
        },
        webpush: {
          notification: {
            icon: '/logo.png', // Main assets icon
            click_action: payload.url || '/',
          }
        }
      };

      // 3. Dispatch to Firebase cloud gateway
      const response = await admin.messaging().sendEachForMulticast(message);
      
      this.logger.log(`🎉 Push dispatched: ${response.successCount} succeeded, ${response.failureCount} failed.`);
      
      // Cleanup broken/expired tokens from database
      if (response.failureCount > 0) {
        const tokensToRemove: string[] = [];
        response.responses.forEach((res, idx) => {
          if (!res.success && res.error) {
            const code = res.error.code;
            if (
              code === 'messaging/invalid-registration-token' ||
              code === 'messaging/registration-token-not-registered'
            ) {
              tokensToRemove.push(tokens[idx]);
            }
          }
        });

        if (tokensToRemove.length > 0) {
          await this.prisma.deviceToken.deleteMany({
            where: { token: { in: tokensToRemove } }
          });
          this.logger.log(`🧹 Cleaned up ${tokensToRemove.length} expired FCM registration tokens.`);
        }
      }
    } catch (e: any) {
      this.logger.error(`❌ Failed to execute multi-cast FCM dispatch: ${e.message}`);
    }
  }

  /**
   * Broadcasts a new event to a list of matched users and saves to the Notification table
   */
  async sendEventNotifications(users: { id: string }[], event: any) {
    if (users.length === 0) return;
    
    this.logger.log(`Dispatching AI event notifications to ${users.length} matched users.`);
    const payload = {
      title: '📅 New Event Recommendation!',
      body: `AI suggested an event for you: ${event.title} at ${event.venue}`,
      url: `/events`
    };

    // 1. Send FCM push to all users concurrently
    await Promise.all(users.map(user => this.sendPushToUser(user.id, payload)));

    // 2. Save notifications to the database for analytics and in-app display
    const notificationData = users.map(user => ({
      userId: user.id,
      eventId: event.id,
      title: payload.title,
      body: payload.body,
      sentStatus: true
    }));

    await this.prisma.notification.createMany({
      data: notificationData,
      skipDuplicates: true
    });
  }
}
