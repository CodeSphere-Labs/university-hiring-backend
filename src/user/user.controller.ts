import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/common/guards/role.guard';
import {
  UserInterceptor,
  UserInterceptorRequest,
} from 'src/common/interceptors/user.interceptor';
import { TransformDataInterceptor } from 'src/common/transform.data';
import { GetAllUsersDto } from 'src/user/dto/user.all.request.dto';
import { UpdateUserDto } from 'src/user/dto/user.change.request.dto';
import { ResponseUserMeDto } from 'src/user/dto/user.response.dto';
import { UserService } from 'src/user/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(ResponseUserMeDto))
  async getAll(@Query() filters: GetAllUsersDto) {
    return this.userService.getAll(filters);
  }

  @Get(':id')
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(ResponseUserMeDto))
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getById(id);
  }

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

  @Delete(':id')
  @Roles(['ADMIN'])
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(ResponseUserMeDto))
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.delete(id);
  }
}
