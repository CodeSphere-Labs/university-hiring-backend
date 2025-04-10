import {
  BadRequestException,
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

  async findAll(
    withResponses: boolean,
    createdByMe: boolean,
    page: number = 1,
    limit: number = 10,
    user: UserInterceptorResponse,
    search?: string,
  ) {
    const skip = search ? 0 : (page - 1) * limit;
    const take = search ? undefined : limit;

    const whereCondition: any = {};

    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (createdByMe) {
      whereCondition.organizationId = user.organizationId;
    }

    const opportunities = await this.prisma.opportunity.findMany({
      where: whereCondition,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        organization: true,
        requiredSkills: true,
        responses: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        ...(withResponses && {
          responses: {
            include: {
              student: {
                include: {
                  user: {
                    include: {
                      studentProfile: {
                        include: {
                          skills: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      },
    });

    const opportunitiesWithRespondedUsers = opportunities.map((opportunity) => {
      const { responses, ...opportunityWithoutResponses } = opportunity;
      return {
        ...opportunityWithoutResponses,
        responses,
        respondedUserIds: responses.map((response) => response.student.user.id),
      };
    });

    const total = await this.prisma.opportunity.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: opportunitiesWithRespondedUsers,
      meta: {
        page: search ? 1 : page,
        limit: search ? total : limit,
        totalItems: total,
        totalPages,
      },
    };
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

    if (user.organizationId === null) {
      throw new BadRequestException(ErrorCodes['YOUR_ORGANIZATION_NOT_FOUND']);
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

  async getById(opportunityId: number) {
    const opportunity = await this.prisma.opportunity.findUniqueOrThrow({
      where: { id: opportunityId },
      include: {
        requiredSkills: true,
      },
    });

    return opportunity;
  }

  async delete(opportunityId: number) {
    await this.prisma.opportunityResponse.deleteMany({
      where: { opportunityId },
    });

    return await this.prisma.opportunity.delete({
      where: { id: opportunityId },
    });
  }

  async getResponses(
    opportunityId: number,
    page: number = 1,
    limit: number = 10,
    status: 'waiting' | 'accepted' | 'rejected',
  ) {
    const skip = (page - 1) * limit;

    const whereCondition: any = {
      opportunityId,
      status: status.toUpperCase(),
    };

    // if (search) {
    //   whereCondition.OR = [
    //     {
    //       student: {
    //         user: {
    //           OR: [
    //             { firstName: { contains: search, mode: 'insensitive' } },
    //             { lastName: { contains: search, mode: 'insensitive' } },
    //             { email: { contains: search, mode: 'insensitive' } },
    //           ],
    //         },
    //       },
    //     },
    //   ];
    // }

    const [responses, total] = await Promise.all([
      this.prisma.opportunityResponse.findMany({
        skip,
        take: limit,
        where: whereCondition,
        include: {
          student: {
            include: {
              user: {
                include: {
                  organization: true,
                  studentProfile: {
                    include: {
                      skills: true,
                      group: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      this.prisma.opportunityResponse.count({
        where: whereCondition,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: responses,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages,
      },
    };
  }

  async updateResponseStatus(
    opportunityId: number,
    responseId: number,
    status: 'accepted' | 'rejected' | 'waiting',
  ) {
    const response = await this.prisma.opportunityResponse.update({
      where: {
        id: responseId,
        opportunityId,
      },
      data: {
        status: status.toUpperCase() as 'ACCEPTED' | 'REJECTED' | 'WAITING',
      },
      include: {
        student: {
          include: {
            user: {
              include: {
                organization: true,
                studentProfile: {
                  include: {
                    skills: true,
                    group: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return response;
  }
}
