import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import type { Response } from 'express';
import { SignInDto } from './dto/signin.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const { accessToken, refreshToken, user } =
        await this.authService.signIn(signInDto);

      this.authService.setRefreshTokenCookie(
        response,
        refreshToken,
        accessToken,
      );

      return { ...user, accessToken };
    } catch {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('refresh-token')
  async refresh(
    @Req() request: Request & { cookies: { refreshToken: string } },
  ) {
    const refreshToken = request.cookies['refreshToken'];
    try {
      return await this.authService.refreshToken(refreshToken);
    } catch {
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get('log-out/:id')
  async logout(
    @Param('id') id: string | number,
  ): Promise<{ success: boolean }> {
    try {
      await this.authService.logout(Number(id));
      return { success: true };
    } catch {
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }
  }
}
