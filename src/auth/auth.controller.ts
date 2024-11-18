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
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import type { Response } from 'express';
import { SignInDto } from './dto/signin.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { TransformDataInterceptor } from 'src/common/transform.data';
import { ResponseUserDto } from 'src/common/baseDto/responseUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @UseInterceptors(new TransformDataInterceptor(ResponseUserDto))
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

      return user;
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
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshTokenRequest = request.cookies['refreshToken'];
    try {
      const { refreshToken, accessToken } =
        await this.authService.refreshToken(refreshTokenRequest);

      this.authService.setRefreshTokenCookie(
        response,
        refreshToken,
        accessToken,
      );

      return { status: 'Success' };
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
