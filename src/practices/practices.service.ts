import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePracticeDto } from './dto/create.practice.dto';
import { PrismaService } from 'src/database/prisma.service';
import { UserInterceptorResponse } from 'src/common/interceptors/user.interceptor';
import { Prisma } from '@prisma/client';

interface FindPracticesOptions {
  page?: string;
  limit?: string;
  filter?: 'all' | 'createdByMe';
  search?: string;
}

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
        createdById: user.id,
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

  async findPractices(
    user: UserInterceptorResponse,
    options: FindPracticesOptions = {},
  ) {
    const { page, limit, filter = 'all', search } = options;
    const pageNumber = page ? parseInt(page) : 1;
    const limitNumber = limit ? parseInt(limit) : 10;
    const skip = (pageNumber - 1) * limitNumber;

    const baseWhere = this.getBaseWhereCondition(user, filter);
    const searchWhere = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              address: { contains: search, mode: Prisma.QueryMode.insensitive },
            },
            { notes: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [practices, total] = await Promise.all([
      this.prisma.practice.findMany({
        where: {
          ...baseWhere,
          ...searchWhere,
        },
        include: this.getPracticeInclude(),
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.practice.count({
        where: {
          ...baseWhere,
          ...searchWhere,
        },
      }),
    ]);

    return this.formatResponse(practices, total, pageNumber, limitNumber);
  }

  async findPracticeById(id: number) {
    const practice = await this.prisma.practice.findUniqueOrThrow({
      where: {
        id,
      },
      include: this.getPracticeInclude(),
    });

    if (!practice) {
      throw new NotFoundException('Практика не найдена');
    }

    return practice;
  }

  private getBaseWhereCondition(user: UserInterceptorResponse, filter: string) {
    if (user.role === 'STUDENT') {
      return {
        students: {
          some: {
            userId: user.id,
          },
        },
      };
    }

    const roleBasedWhere =
      user.role === 'UNIVERSITY_STAFF'
        ? { universityId: user.organizationId }
        : { organizationId: user.organizationId };

    const filterBasedWhere =
      filter === 'createdByMe' ? { createdById: user.id } : {};

    return {
      ...roleBasedWhere,
      ...filterBasedWhere,
    };
  }

  private getPracticeInclude() {
    return {
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
    };
  }

  private formatResponse(
    practices: any[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      data: practices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
