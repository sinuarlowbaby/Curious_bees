import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentInput } from '@srm-recollab/types';
import { CreateCommentSchema } from '@srm-recollab/shared-utils';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async createComment(authorId: string, input: CreateCommentInput) {
    const parsed = CreateCommentSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0].message);
    }

    const { content, threadId } = parsed.data;

    // Check if thread exists
    const threadExists = await this.prisma.thread.findUnique({
      where: { id: threadId }
    });
    if (!threadExists) {
      throw new BadRequestException('The thread does not exist.');
    }

    return this.prisma.comment.create({
      data: {
        content,
        threadId,
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            department: true
          }
        }
      }
    });
  }
}
