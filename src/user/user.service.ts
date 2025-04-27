import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateUserDto } from 'src/user/dto/user.change.request.dto';
import { Prisma } from '@prisma/client';
import { UserInterceptorResponse } from 'src/common/interceptors/user.interceptor';
import { GetAllUsersDto } from 'src/user/dto/user.all.request.dto';
import { ErrorCodes } from 'src/common/enums/error-codes';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(filters: GetAllUsersDto) {
    const { role, organizationId, firstName } = filters;

    const whereClause: Prisma.UserWhereInput = {};

    if (role) whereClause.role = role;
    if (organizationId) whereClause.organizationId = organizationId;
    if (firstName)
      whereClause.OR = [
        { firstName: { contains: firstName, mode: 'insensitive' } },
        { lastName: { contains: firstName, mode: 'insensitive' } },
      ];

    return await this.prisma.user.findMany({
      where: whereClause,
      include: {
        studentProfile: {
          include: {
            group: true,
          },
        },
        organization: true,
      },
    });
  }

  async getById(id: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: {
        studentProfile: {
          include: {
            group: true,
            skills: true,
          },
        },
        organization: true,
      },
    });

    return {
      ...user,
      ...(user.role === 'STUDENT' && {
        studentProfile: {
          ...user.studentProfile,
          skills: user.studentProfile?.skills?.map((skill) => skill.name) || [],
        },
      }),
    };
  }

  async updateUser(user: UserInterceptorResponse, userBody: UpdateUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { resume, githubLink, projects, skills, group, ...userUpdates } =
      userBody;

    if (user.role === 'STUDENT') {
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

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...userUpdates,
          studentProfile: {
            upsert: {
              create: {
                resume,
                githubLink,
                projects: projects as unknown as Prisma.JsonArray,
                ...(skillIds.length > 0 && {
                  skills: {
                    connect: skillIds,
                  },
                }),
              },
              update: {
                resume,
                githubLink,
                projects: projects as unknown as Prisma.JsonArray,
                ...(skillIds.length > 0 && {
                  skills: {
                    set: skillIds,
                  },
                }),
              },
            },
          },
        },
        include: {
          organization: true,
          studentProfile: {
            include: {
              group: true,
              skills: true,
            },
          },
        },
      });

      return {
        ...updatedUser,
        studentProfile: {
          ...updatedUser.studentProfile,
          skills:
            updatedUser.studentProfile?.skills?.map((skill) => skill.name) ||
            [],
        },
      };
    }

    return await this.prisma.user.update({
      where: { id: user.id },
      data: userUpdates,
      include: {
        organization: true,
      },
    });
  }

  async delete(user: UserInterceptorResponse, id: number) {
    const userToDelete = await this.prisma.user.findUniqueOrThrow({
      where: { id },
    });

    if (userToDelete.role === user.role) {
      throw new ForbiddenException(ErrorCodes['FORBIDDEN']);
    }

    return await this.prisma.user.delete({ where: { id } });
  }

  async findUsersByOrganization(organizationId: number) {
    const users = await this.prisma.user.findMany({
      where: {
        organizationId,
      },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      patronymic: user.patronymic,
      email: user.email,
      avatarUrl: user.avatarUrl,
      aboutMe: user.aboutMe,
      role: user.role,
      createdAt: user.createdAt,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        type: user.organization.type,
        email: user.organization.email,
        logoUrl: user.organization.logoUrl,
        websiteUrl: user.organization.websiteUrl,
        about: user.organization.about,
      },
    }));
  }
}
