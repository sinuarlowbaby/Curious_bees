import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { InterestMatcherService } from './interest-matcher.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, InterestMatcherService],
  exports: [NotificationsService, InterestMatcherService]
})
export class NotificationsModule {}
