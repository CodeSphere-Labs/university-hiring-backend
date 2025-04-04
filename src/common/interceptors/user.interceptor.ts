/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

export type UserInterceptorResponse = Omit<
  User,
  'passwordHash' | 'refreshToken'
>;

export interface UserInterceptorRequest extends Request {
  user: UserInterceptorResponse;
  cookies: { accessToken: string };
}

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<UserInterceptorRequest>();
    const accessToken = request.cookies?.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const decodedToken = this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('jwt.access'),
      });

      if (!decodedToken.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: decodedToken.sub },
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
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const {
        passwordHash,
        refreshToken,
        studentProfile,
        ...userWithoutSecrets
      } = user;

      request.user = {
        ...userWithoutSecrets,
        ...(user.role === 'STUDENT' && {
          studentProfile: {
            ...studentProfile,
            skills: studentProfile.skills.map((skill) => skill.name),
          },
        }),
      };

      return next.handle();
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
