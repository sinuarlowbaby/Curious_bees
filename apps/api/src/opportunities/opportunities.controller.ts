import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityInput } from '@srm-recollab/types';

@Controller('opportunities')
@UseGuards(FirebaseAuthGuard)
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  async getOpportunities(
    @Query('department') department?: string,
    @Query('researchDomain') researchDomain?: string
  ) {
    return this.opportunitiesService.getOpportunities(department, researchDomain);
  }

  @Post()
  async createOpportunity(@Req() req: any, @Body() body: CreateOpportunityInput) {
    return this.opportunitiesService.createOpportunity(req.user.id, body);
  }
}
