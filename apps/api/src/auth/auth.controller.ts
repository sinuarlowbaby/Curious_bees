import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() req: any) {
    return {
      success: true,
      user: req.user
    };
  }
}
