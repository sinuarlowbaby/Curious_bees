import { Controller, Get, Put, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileInput } from '@srm-recollab/types';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileInput) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Get('collaborators')
  async getCollaborators(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('department') department?: string
  ) {
    return this.usersService.getCollaborators(req.user.id, search, department);
  }

  @Get('interests')
  async getAllInterests() {
    return this.usersService.getAllInterests();
  }
}
