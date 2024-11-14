import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';

import { SignInDto } from './dto/signin.dto';
import { saltRounds } from 'src/common/constants';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this.generateAndStoreTokens(
      user.id,
      user.email,
      user.role,
    );
    return tokens;
  }

  async signIn(signInDto: SignInDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email: signInDto.email },
    });

    if (
      !user ||
      !(await bcrypt.compare(signInDto.hashPassword, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateAndStoreTokens(
      user.id,
      user.email,
      user.role,
    );
    return { ...tokens, user };
  }

  async logout(userId: number): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: refreshTokenDto.userId },
    });

    if (
      !user ||
      !(await bcrypt.compare(refreshTokenDto.refreshToken, user.refreshToken))
    ) {
      throw new ForbiddenException('Access Denied: Invalid refresh token');
    }

    if (
      !this.verifyToken(
        refreshTokenDto.refreshToken,
        process.env.JWT_REFRESH_SECRET,
      )
    ) {
      throw new ForbiddenException('Invalid Refresh Token');
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
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this.getTokens(userId, email, role);
    await this.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  private async getTokens(
    userId: number,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

  private async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  private verifyToken(token: string, secret: string): boolean {
    try {
      this.jwtService.verify(token, { secret });
      return true;
    } catch {
      throw new HttpException('cannot verify token', HttpStatus.BAD_REQUEST);
    }
  }
}
