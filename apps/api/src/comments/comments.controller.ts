import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { CommentsService } from './comments.service';
import { CreateCommentInput } from '@srm-recollab/types';

@Controller('comments')
@UseGuards(FirebaseAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(@Req() req: any, @Body() body: CreateCommentInput) {
    return this.commentsService.createComment(req.user.id, body);
  }
}
