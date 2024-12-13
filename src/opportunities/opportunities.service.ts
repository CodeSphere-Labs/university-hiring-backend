import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserInterceptorResponse } from 'src/common/interceptors/user.interceptor';
import { PrismaService } from 'src/database/prisma.service';
import { CreateOpportunityDto } from 'src/opportunities/dto/create.opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(withResponses: boolean) {
    return await this.prisma.opportunity.findMany({
      include: {
        requiredSkills: true,

        ...(withResponses && {
          responses: {
            include: {
              student: true,
            },
          },
        }),
      },
    });
  }

  async create(dto: CreateOpportunityDto, user: UserInterceptorResponse) {
    const { title, description, skillIds } = dto;

    const skillConnections = skillIds.map((id) => ({ id }));

    return await this.prisma.opportunity.create({
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

  async response(
    opportunityId: number,
    user: UserInterceptorResponse,
    coverLetter: string,
  ) {
    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (!studentProfile) {
      throw new NotFoundException('Student profile not found for this user.');
    }

    const existingResponse = await this.prisma.opportunityResponse.findFirst({
      where: {
        opportunityId,
        studentId: studentProfile.id,
      },
    });

    if (existingResponse) {
      throw new ConflictException(
        'You have already responded to this opportunity.',
      );
    }

    return await this.prisma.opportunityResponse.create({
      data: {
        opportunityId,
        studentId: studentProfile.id,
        coverLetter,
      },
    });
  }
}
