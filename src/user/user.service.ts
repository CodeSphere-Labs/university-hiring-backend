import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateUserDto } from 'src/user/dto/user.change.request.dto';
import { Prisma } from '@prisma/client';
import { UserInterceptorResponse } from 'src/common/interceptors/user.interceptor';
import { GetAllUsersDto } from 'src/user/dto/user.all.request.dto';

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
    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
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

  async updateUser(user: UserInterceptorResponse, userBody: UpdateUserDto) {
    const { resume, githubLink, projects, skills, ...userUpdates } = userBody;

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
      throw new ForbiddenException('You cannot user with the same role');
    }

    return await this.prisma.user.delete({ where: { id } });
  }
}
