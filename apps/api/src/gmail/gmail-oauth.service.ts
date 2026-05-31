import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { google, Auth, gmail_v1 } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GmailOauthService implements OnModuleInit {
  private readonly logger = new Logger(GmailOauthService.name);
  private oauth2Client: Auth.OAuth2Client;

  constructor(private readonly prisma: PrismaService) {
    const clientId = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GMAIL_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/events/gmail/callback';

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  async onModuleInit() {
    await this.initializeCredentials();
  }

  /**
   * Initializes the OAuth2 client using credentials from the DB if they exist.
   */
  async initializeCredentials() {
    try {
      const credentials = await this.prisma.gmailCredentials.findUnique({
        where: { id: 'singleton' },
      });

      if (credentials) {
        this.oauth2Client.setCredentials({
          access_token: credentials.accessToken,
          refresh_token: credentials.refreshToken,
          expiry_date: credentials.expiresAt.getTime(),
        });
        
        // Listen for automatic token refreshes and persist them
        this.oauth2Client.on('tokens', async (tokens) => {
          this.logger.log('Gmail OAuth tokens refreshed automatically.');
          await this.saveCredentials(tokens);
        });

        this.logger.log('Gmail OAuth Client successfully initialized from database.');
      } else {
        this.logger.warn('No Gmail credentials found in the database. You must authenticate via OAuth first.');
      }
    } catch (error: any) {
      this.logger.error(`Failed to initialize Gmail credentials: ${error.message}`);
    }
  }

  /**
   * Generates the URL for the user to authorize Gmail access.
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to receive a refresh token
      prompt: 'consent', // Force consent prompt to guarantee refresh token
      scope: ['https://www.googleapis.com/auth/gmail.modify'],
    });
  }

  /**
   * Exchanges an authorization code for tokens and saves them to the database.
   */
  async handleCallback(code: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    await this.saveCredentials(tokens);
    this.logger.log('Successfully authenticated and saved Gmail OAuth tokens.');
  }

  /**
   * Saves tokens to the Prisma database.
   */
  private async saveCredentials(tokens: Auth.Credentials): Promise<void> {
    if (!tokens.access_token) return;

    await this.prisma.gmailCredentials.upsert({
      where: { id: 'singleton' },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '', // Sometimes not returned if not offline/consent
        expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
      },
      create: {
        id: 'singleton',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
      },
    });
  }

  /**
   * Returns a ready-to-use Gmail API client.
   */
  getGmailClient(): gmail_v1.Gmail {
    return google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Helper to check if we are authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.oauth2Client.credentials.access_token;
  }
}
