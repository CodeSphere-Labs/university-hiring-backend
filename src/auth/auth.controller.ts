import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { RefreshTokenDto } from './dto/refreshToken.dto';

import type { Response } from 'express';
import { ResponseSignUpDto } from './dto/responseSignUp.dto';
import { SignInDto } from './dto/signin.dto';
import { TransformDataInterceptor } from 'src/common/transform.data';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(
  ClassSerializerInterceptor,
  new TransformDataInterceptor(ResponseSignUpDto),
)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseSignUpDto> {
    try {
      const { accessToken, refreshToken, user } =
        await this.authService.signIn(signInDto);

      this.setRefreshTokenCookie(response, refreshToken);

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

  private setRefreshTokenCookie(response: Response, token: string): void {
    response.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'lax',
    });
  }
}
