import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AddStudentToGroupRequestDto } from 'src/groups/dto/addStudentToGroup.request.dto';
import { CreateGroupRequestDto } from 'src/groups/dto/create.group.request.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(withStudents: boolean, search?: string) {
    const whereCondition: Prisma.GroupWhereInput = {};

    if (search) {
      whereCondition.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return await this.prisma.group.findMany({
      where: whereCondition,
      include: {
        ...(withStudents && {
          students: {
            include: this.getStudentInclude(),
          },
        }),
      },
    });
  }

  async getById(
    id: number,
    withStudents: boolean,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const { skip, take } = this.getPaginationParams(search, page, limit);

    const group = await this.prisma.group.findUniqueOrThrow({
      where: { id },
      include: {
        ...(withStudents && {
          students: {
            skip,
            take,
            where: search
              ? {
                  user: {
                    id: {
                      in:
                        (await this.findStudentsBySearch(id, search)).length > 0
                          ? await this.findStudentsBySearch(id, search)
                          : [-1],
                    },
                  },
                }
              : undefined,
            include: this.getStudentInclude(),
          },
        }),
      },
    });

    if (withStudents) {
      const total = search
        ? (await this.findStudentsBySearch(id, search)).length
        : await this.prisma.studentProfile.count({
            where: { groupId: id },
          });

      const totalPages = search ? 1 : Math.ceil(total / limit);

      return {
        ...group,
        students: (group as any).students,
        meta: {
          page: search ? 1 : page,
          limit: search ? total : limit,
          totalItems: total,
          totalPages,
        },
      };
    }

    return group;
  }

  async addStudentToGroup(dto: AddStudentToGroupRequestDto) {
    const { groupId, userId } = dto;

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new HttpException(
        'Group with provided id does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!studentProfile) {
      throw new HttpException(
        'Student profile with provided userId does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (studentProfile.groupId) {
      throw new HttpException(
        `Student is already part of another group (groupId: ${studentProfile.groupId})`,
        HttpStatus.CONFLICT,
      );
    }

    return await this.prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: {
        groupId,
      },
    });
  }

  async createGroup(dto: CreateGroupRequestDto) {
    return await this.prisma.group.create({
      data: {
        name: dto.name.toUpperCase(),
      },
    });
  }

  async delete(id: number) {
    return await this.prisma.group.delete({ where: { id } });
  }

  private async findStudentsBySearch(
    groupId: number,
    search: string,
  ): Promise<number[]> {
    const searchArray = search
      .toLowerCase()
      .split(/\s+/g)
      .map((s) => `%${s}%`);

    const students = await this.prisma.$queryRaw<{ userId: number }[]>`
      SELECT DISTINCT sp."userId"
      FROM "StudentProfile" sp
      JOIN "User" u ON sp."userId" = u.id
      WHERE sp."groupId" = ${groupId}
      AND lower(concat(u."firstName", ' ', u."lastName", ' ', u.patronymic, ' ', u.email))
      LIKE ${Prisma.join(
        searchArray,
        " AND lower(concat(u.\"firstName\", ' ', u.\"lastName\", ' ', u.patronymic, ' ', u.email)) LIKE ",
      )}
    `;

    return students.map((student) => student.userId);
  }

  private getPaginationParams(
    search: string | undefined,
    page: number,
    limit: number,
  ): { skip: number; take?: number } {
    return {
      skip: search ? 0 : (page - 1) * limit,
      take: search ? undefined : limit,
    };
  }

  private getStudentInclude(): Prisma.StudentProfileInclude {
    return {
      user: {
        include: {
          studentProfile: {
            include: {
              skills: true,
            },
          },
          organization: true,
        },
      },
    };
  }

  async getStudentsByGroupId(groupId: number) {
    const group = await this.prisma.group.findUniqueOrThrow({
      where: { id: groupId },
      include: {
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

    return group.students.map((student) => ({
      id: student.user.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      patronymic: student.user.patronymic,
      email: student.user.email,
      avatarUrl: student.user.avatarUrl,
      aboutMe: student.user.aboutMe,
      telegramLink: student.user.telegramLink,
      vkLink: student.user.vkLink,
      role: student.user.role,
      createdAt: student.user.createdAt,
      updatedAt: student.user.updatedAt,
      organization: student.user.organization,
      studentProfile: {
        ...student.user.studentProfile,
        skills: student.user.studentProfile.skills?.map((skill) => skill.name),
      },
    }));
  }
}
