import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateUserDto } from 'src/user/dto/user.change.request.dto';
import { Prisma } from '@prisma/client';
import { UserInterceptorResponse } from 'src/common/interceptors/user.interceptor';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateUser(user: UserInterceptorResponse, userBody: UpdateUserDto) {
    const { resume, githubLink, projects, ...userUpdates } = userBody;

    if (user.role === 'STUDENT') {
      return await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...userUpdates,
          studentProfile: {
            upsert: {
              create: {
                resume,
                githubLink,
                projects: projects as unknown as Prisma.JsonArray,
              },
              update: {
                resume,
                githubLink,
                projects: projects as unknown as Prisma.JsonArray,
              },
            },
          },
        },
        include: {
          studentProfile: true,
        },
      });
    }

    return await this.prisma.user.update({
      where: { id: user.id },
      data: userUpdates,
    });
  }
}
