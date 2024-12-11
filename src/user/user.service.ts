import { ForbiddenException, Injectable } from '@nestjs/common';
import { verifyToken } from 'src/common/utils/verifyToken';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/user/dto/user.change.request.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUser(accessToken: string) {
    const decodedAccessToken = verifyToken(
      accessToken,
      process.env.JWT_ACCESS_SECRET,
    );

    if (!decodedAccessToken) {
      throw new ForbiddenException('Invalid Access Token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decodedAccessToken['sub'] },
      include: {
        organization: true,
        studentProfile: true,
      },
    });

    if (!user) {
      throw new ForbiddenException('Access Denied: Invalid access token');
    }

    return user;
  }

  async updateUser(refreshToken: string, userBody: UpdateUserDto) {
    const { resume, githubLink, projects, ...userUpdates } = userBody;

    const decodedRefreshToken = verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

    if (!decodedRefreshToken) {
      throw new ForbiddenException('Invalid Refresh Token');
    }

    const userId = decodedRefreshToken['sub'];

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        studentProfile: true,
      },
    });

    const isHashTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!user || !isHashTokenValid) {
      throw new ForbiddenException('Access Denied: Invalid refresh token');
    }

    if (user.role === 'STUDENT') {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          studentProfile: {
            update: {
              resume,
              githubLink,
              projects: projects as unknown as Prisma.JsonArray,
            },
          },
        },
        include: {
          studentProfile: true,
        },
      });
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: userUpdates,
    });
  }
}
