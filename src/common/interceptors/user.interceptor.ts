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
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decorator';
import { ErrorCodes } from 'src/common/enums/error-codes';

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
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<UserInterceptorRequest>();
    const accessToken = request.cookies?.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException(ErrorCodes['INVALID_TOKEN']);
    }

    try {
      const decodedToken = this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('jwt.access'),
      });

      if (!decodedToken.sub) {
        throw new UnauthorizedException(ErrorCodes['INVALID_TOKEN']);
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
        throw new UnauthorizedException(ErrorCodes['USER_NOT_FOUND']);
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
    } catch (error) {
      throw new UnauthorizedException(ErrorCodes['INVALID_TOKEN']);
    }
  }
}
