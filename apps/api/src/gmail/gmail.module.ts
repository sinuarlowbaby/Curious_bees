import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GmailOauthService } from './gmail-oauth.service';
import { GmailIngestionService } from './gmail-ingestion.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { GmailController } from './gmail.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BullModule.registerQueue({
      name: 'event-email-processing',
    }),
  ],
  controllers: [GmailController],
  providers: [GmailOauthService, GmailIngestionService],
  exports: [GmailOauthService, GmailIngestionService]
})
export class GmailModule {}
