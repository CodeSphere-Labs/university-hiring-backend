import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

import { SignInDto } from './dto/signin.dto';
import { saltRounds } from 'src/common/constants';
import { PrismaService } from 'src/database/prisma.service';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import { Role } from '@prisma/client';
import { CreateInvitationDto } from 'src/invitation/dto/CreateInvitation.dto';
import { ConfigService } from '@nestjs/config';
import { ErrorCodes } from 'src/common/enums/error-codes';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(
    user: SignUpDto,
    invintation: CreateInvitationDto,
    response: Response,
  ) {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    const createdUser = await this.prisma.user.create({
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        patronymic: user.patronymic,
        passwordHash: hashedPassword,
        role: invintation.role,
      },
    });

    if (invintation.role === Role.STUDENT) {
      await this.prisma.studentProfile.create({
        data: {
          userId: createdUser.id,
          groupId: invintation.groupId,
        },
      });
    }

    const tokens = await this.generateAndStoreTokens(
      createdUser.id,
      createdUser.email,
      createdUser.role,
    );

    this.setRefreshTokenCookie(
      response,
      tokens.refreshToken,
      tokens.accessToken,
    );

    return createdUser;
  }

  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: signInDto.email },
        include: {
          organization: true,
          studentProfile: {
            include: {
              group: true,
            },
          },
        },
      });

      const isPasswordValid = await bcrypt.compare(
        signInDto.password,
        user.passwordHash,
      );

      if (!user || !isPasswordValid) {
        throw new UnauthorizedException(ErrorCodes['INVALID_CREDENTIALS']);
      }

      const tokens = await this.generateAndStoreTokens(
        user.id,
        user.email,
        user.role,
      );
      return { user, ...tokens };
    } catch {
      throw new HttpException(
        ErrorCodes['INVALID_CREDENTIALS'],
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async logout(userId: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    const decodedRefreshToken = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('jwt.refresh'),
    });

    if (!decodedRefreshToken) {
      throw new ForbiddenException('Invalid Refresh Token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decodedRefreshToken['sub'] },
    });

    const isHashTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!user || !isHashTokenValid) {
      throw new ForbiddenException('Access Denied: Invalid refresh token');
    }

    const tokens = await this.generateAndStoreTokens(
      user.id,
      user.email,
      user.role,
    );

    return tokens;
  }

  public setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
    accessToken: string,
  ): void {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
  }

  private async generateAndStoreTokens(
    userId: number,
    email: string,
    role: string,
  ) {
    const tokens = await this.getTokens(userId, email, role);
    await this.updateRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  private async getTokens(userId: number, email: string, role: string) {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role },
      {
        secret: this.configService.get<string>('jwt.access'),
        expiresIn: '15m',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('jwt.refresh'),
        expiresIn: '30d',
      },
    );

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.access'),
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
