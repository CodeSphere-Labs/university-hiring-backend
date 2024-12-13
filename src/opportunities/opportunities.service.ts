import { Injectable } from '@nestjs/common';
import { UserInterceptorResponse } from 'src/common/interceptors/user.interceptor';
import { PrismaService } from 'src/database/prisma.service';
import { CreateOpportunityDto } from 'src/opportunities/dto/create.opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.opportunity.findMany({
      include: {
        responses: true,
        requiredSkills: true,
      },
    });
  }

  async create(dto: CreateOpportunityDto, user: UserInterceptorResponse) {
    const { title, description, skillIds } = dto;

    const skillConnections = skillIds.map((id) => ({ id }));

    return this.prisma.opportunity.create({
      data: {
        title,
        description,
        organizationId: user.organizationId,
        requiredSkills: {
          connect: skillConnections,
        },
      },
    });
  }
}
