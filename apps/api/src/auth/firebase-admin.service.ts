import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private firebaseApp: admin.app.App;

  onModuleInit() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKeyRaw) {
      this.logger.error('⚠️ Missing Firebase Admin credentials in environment variables.');
      return;
    }

    try {
      // Parse private key formatting (replaces string literal \n with actual newlines)
      const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

      this.logger.log('🚀 Firebase Admin SDK initialized successfully.');
    } catch (e: any) {
      this.logger.error(`❌ Failed to initialize Firebase Admin SDK: ${e.message}`);
    }
  }

  /**
   * Securely verify a Firebase JWT ID Token passed from the frontend
   */
  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    if (!this.firebaseApp) {
      throw new Error('Firebase Admin Service is not initialized.');
    }
    return admin.auth().verifyIdToken(token);
  }
}
