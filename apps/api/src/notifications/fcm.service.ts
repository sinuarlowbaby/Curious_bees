import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FCMService {
  private readonly logger = new Logger(FCMService.name);

  async sendToToken(token: string, title: string, body: string, data?: any) {
    try {
      const response = await admin.messaging().send({
        token,
        notification: { title, body },
        data: data || {},
      });
      this.logger.debug(`Successfully sent FCM message: ${response}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send FCM message: ${error.message}`);
      return false;
    }
  }

  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    try {
      const response = await admin.messaging().send({
        topic,
        notification: { title, body },
        data: data || {},
      });
      this.logger.debug(`Successfully sent FCM topic message to ${topic}: ${response}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send FCM topic message: ${error.message}`);
      return false;
    }
  }

  async subscribeToTopic(tokens: string[], topic: string) {
    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`Successfully subscribed tokens to topic ${topic}`);
    } catch (error: any) {
      this.logger.error(`Failed to subscribe tokens to topic ${topic}: ${error.message}`);
    }
  }
}
