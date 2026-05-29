import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityInput } from '@srm-recollab/types';
import { CreateOpportunitySchema } from '@srm-recollab/shared-utils';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async getOpportunities(department?: string, researchDomain?: string) {
    return this.prisma.opportunity.findMany({
      where: {
        ...(department && { department }),
        ...(researchDomain && {
          researchDomain: { contains: researchDomain, mode: 'insensitive' }
        })
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async createOpportunity(authorId: string, input: CreateOpportunityInput) {
    const parsed = CreateOpportunitySchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0].message);
    }

    const { title, description, department, researchDomain } = parsed.data;

    // Verify user role is FACULTY (only faculty can post opportunities)
    const author = await this.prisma.user.findUnique({
      where: { id: authorId }
    });

    if (!author || author.role !== 'FACULTY') {
      throw new BadRequestException('Only verified faculty members are authorized to post research opportunities.');
    }

    return this.prisma.opportunity.create({
      data: {
        title,
        description,
        department,
        researchDomain,
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
