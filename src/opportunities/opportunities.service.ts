import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ErrorCodes } from 'src/common/enums/error-codes';
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
        organization: true,
        ...(withResponses && {
          responses: {
            include: {
              student: {
                include: {
                  user: {
                    include: {
                      organization: true,
                    },
                  },
                },
              },
            },
          },
        }),
      },
    });
  }

  async create(dto: CreateOpportunityDto, user: UserInterceptorResponse) {
    const { title, description, skills } = dto;

    let skillIds: { id: number }[] = [];
    if (skills && skills.length > 0) {
      const foundSkills = await this.prisma.skill.findMany({
        where: {
          name: {
            in: skills,
          },
        },
      });
      skillIds = foundSkills.map((skill) => ({ id: skill.id }));
    }

    return await this.prisma.opportunity.create({
      data: {
        title,
        description,
        organizationId: user.organizationId,
        requiredSkills: {
          connect: skillIds,
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
      throw new ConflictException(ErrorCodes['ALREADY_RESPONDED']);
    }

    return await this.prisma.opportunityResponse.create({
      data: {
        opportunityId,
        studentId: studentProfile.id,
        coverLetter,
      },
    });
  }

  async getById(opportunityId: number, withResponses: boolean) {
    return await this.prisma.opportunity.findUniqueOrThrow({
      where: { id: opportunityId },
      ...(withResponses && {
        include: {
          requiredSkills: true,
          organization: true,
          responses: {
            include: {
              student: {
                include: {
                  user: {
                    include: {
                      organization: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    });
  }

  async delete(opportunityId: number) {
    await this.prisma.opportunityResponse.deleteMany({
      where: { opportunityId },
    });

    return await this.prisma.opportunity.delete({
      where: { id: opportunityId },
    });
  }
}
