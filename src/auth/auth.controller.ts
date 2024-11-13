import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { RefreshTokenDto } from './dto/refreshToken.dto';

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
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh-token')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    try {
      return await this.authService.refreshToken(refreshTokenDto);
    } catch (error) {
      throw error;
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
    } catch (error) {
      throw error;
    }
  }
}
