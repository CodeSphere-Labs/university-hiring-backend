import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  UserInterceptor,
  UserInterceptorRequest,
} from 'src/common/interceptors/user.interceptor';
import { TransformDataInterceptor } from 'src/common/transform.data';
import { UpdateUserDto } from 'src/user/dto/user.change.request.dto';
import { ResponseUserMeDto } from 'src/user/dto/user.response.dto';
import { UserService } from 'src/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(ResponseUserMeDto))
  async getMe(@Req() request: UserInterceptorRequest) {
    return request.user;
  }

  @Patch('profile')
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(ResponseUserMeDto))
  async patchMe(
    @Body() dto: UpdateUserDto,
    @Req() request: UserInterceptorRequest,
  ) {
    return await this.userService.updateUser(request.user, dto);
  }
}
