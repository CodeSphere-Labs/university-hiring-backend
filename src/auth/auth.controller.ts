import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

import type { Response } from 'express';
import { SignInDto } from './dto/signin.dto';
import { TransformDataInterceptor } from 'src/common/transform.data';
import { ResponseUserDto } from 'src/common/baseDto/responseUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  @UseInterceptors(new TransformDataInterceptor(ResponseUserDto))
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.signIn(signInDto);

    this.authService.setRefreshTokenCookie(response, refreshToken, accessToken);

    return user;
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

  @Get('logout')
  async logout(
    @Query('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      await this.authService.logout(Number(id));
      response.clearCookie('accessToken');
      response.clearCookie('refreshToken');
      return { success: true };
    } catch {
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }
  }
}
