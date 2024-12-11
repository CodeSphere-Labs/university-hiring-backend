import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { TransformDataInterceptor } from 'src/common/transform.data';
import { UpdateUserDto } from 'src/user/dto/user.change.request.dto';
import { ResponseUserMeDto } from 'src/user/dto/user.response.dto';
import { UserService } from 'src/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseInterceptors(new TransformDataInterceptor(ResponseUserMeDto))
  async getMe(@Req() request: Request & { cookies: { accessToken: string } }) {
    const accessTokenRequest = request.cookies['accessToken'];

    return await this.userService.getUser(accessTokenRequest);
  }

  @Patch('profile')
  @UseInterceptors(new TransformDataInterceptor(ResponseUserMeDto))
  async patchMe(
    @Body() user: UpdateUserDto,
    @Req() request: Request & { cookies: { refreshToken: string } },
  ) {
    const refreshTokenRequest = request.cookies['refreshToken'];
    return await this.userService.updateUser(refreshTokenRequest, user);
  }
}
