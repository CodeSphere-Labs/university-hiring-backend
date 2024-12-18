import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateGroupRequestDto } from 'src/groups/dto/create.group.request.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return await this.prisma.group.findMany({
      include: {
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
      },
    });
  }

  async getById(id: number) {
    return await this.prisma.group.findUniqueOrThrow({
      where: { id },
      include: {
        students: true,
      },
    });
  }

  async createGroup(dto: CreateGroupRequestDto) {
    return await this.prisma.group.create({ data: dto });
  }
}
