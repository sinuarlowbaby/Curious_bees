import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register')
  async registerToken(@Req() req: any, @Body() body: { token: string }) {
    const result = await this.notificationsService.registerToken(req.user.id, body.token);
    return {
      success: true,
      deviceId: result.id
    };
  }
}
