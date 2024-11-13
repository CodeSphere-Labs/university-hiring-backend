import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';

import { SignInDto } from './dto/signin.dto';
import { PrismaService } from 'src/database/prisma.service';
import { saltRounds } from 'src/common/constants';
import type { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(user: any) {
    const tokens = await this.generateAndStoreTokens(
      user.id,
      user.email,
      user.role,
    );
    return tokens;
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: signInDto.email },
    });

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      user.passwordHash,
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateAndStoreTokens(
      user.id,
      user.email,
      user.role,
    );
    return { user, ...tokens };
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    const decodedRefreshToken = this.verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

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
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '30d' },
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

  private verifyToken(token: string, secret: string) {
    try {
      return this.jwtService.verify(token, { secret });
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
    accessToken: string,
  ): void {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
    });

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
    });
  }
}
