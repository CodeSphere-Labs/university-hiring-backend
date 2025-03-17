import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { AddStudentToGroupRequestDto } from 'src/groups/dto/addStudentToGroup.request.dto';
import { CreateGroupRequestDto } from 'src/groups/dto/create.group.request.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(withStudents: boolean) {
    return await this.prisma.group.findMany({
      include: {
        ...(withStudents && {
          students: {
            include: {
              user: {
                include: {
                  studentProfile: true,
                  organization: true,
                },
              },
            },
          },
        }),
      },
    });
  }

  async getById(id: number, withStudents: boolean) {
    return await this.prisma.group.findUniqueOrThrow({
      where: { id },
      include: {
        ...(withStudents && {
          students: {
            include: {
              user: {
                include: {
                  studentProfile: true,
                  organization: true,
                },
              },
            },
          },
        }),
      },
    });
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
}
