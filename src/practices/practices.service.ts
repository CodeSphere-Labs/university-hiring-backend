import { Injectable } from '@nestjs/common';
import { CreatePracticeDto } from './dto/create.practice.dto';
import { PrismaService } from 'src/database/prisma.service';
import { UserInterceptorResponse } from 'src/common/interceptors/user.interceptor';

@Injectable()
export class PracticesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createPracticeDto: CreatePracticeDto,
    user: UserInterceptorResponse,
  ) {
    const { studentIds, ...practiceData } = createPracticeDto;

    return this.prisma.practice.create({
      data: {
        ...practiceData,
        universityId: user.organizationId,
        students: {
          connect: studentIds.map((id) => ({ id })),
        },
      },
      include: {
        group: true,
        university: true,
        organization: true,
        students: {
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
  }

  async findByUniversity(universityId: number) {
    return this.prisma.practice.findMany({
      where: {
        universityId,
      },
      include: {
        group: true,
        university: true,
        organization: true,
        students: {
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
  }

  async findByOrganization(organizationId: number) {
    return this.prisma.practice.findMany({
      where: {
        organizationId,
      },
      include: {
        group: true,
        university: true,
        organization: true,
        students: {
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
  }
}
