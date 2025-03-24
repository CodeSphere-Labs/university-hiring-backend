import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
} from '@nestjs/common';
import { Roles } from 'src/common/guards/role.guard';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/CreateInvitation.dto';
import { ConfirmInvitationDto } from 'src/invitation/dto/ConfirmInvitation.dto';
import type { Response } from 'express';
import { ResponseUserDto } from 'src/common/baseDto/responseUser.dto';
import { TransformDataInterceptor } from 'src/common/transform.data';
import {
  UserInterceptor,
  UserInterceptorRequest,
} from 'src/common/interceptors/user.interceptor';
import { ResponseInvitationDto } from './dto/ResponseInvitationDto';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get('stats')
  @UseInterceptors(UserInterceptor)
  @Roles(['ADMIN', 'STAFF', 'UNIVERSITY_STAFF'])
  async getInvitationStats(
    @Req() request: UserInterceptorRequest,
    @Query('filter') filter: 'createdByMe' | 'all' = 'createdByMe',
  ) {
    return this.invitationService.getInvitationStats(request.user, filter);
  }

  @Get()
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(ResponseInvitationDto))
  @Roles(['ADMIN', 'STAFF', 'UNIVERSITY_STAFF'])
  async getInvitations(
    @Req() request: UserInterceptorRequest,
    @Query('filter') filter: 'createdByMe' | 'all' = 'createdByMe',
    @Query('status') status: 'all' | 'accept' | 'wait' | 'expired' = 'all',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.invitationService.getInvitations(
      request.user,
      filter,
      status,
      page,
      limit,
    );
  }

  @Post('create-invitation')
  @UseInterceptors(UserInterceptor)
  @Roles(['ADMIN', 'STAFF', 'UNIVERSITY_STAFF'])
  async createStaffInvitation(
    @Req() request: UserInterceptorRequest,
    @Body() invitationDto: CreateInvitationDto,
  ) {
    return this.invitationService.createInvitation(
      invitationDto,
      request.user.id,
    );
  }

  @Post('confirm-invitation')
  @UseInterceptors(new TransformDataInterceptor(ResponseUserDto))
  async confirmRegisration(
    @Body() confirmInvitationDto: ConfirmInvitationDto,
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.invitationService.confirmInvitation(
      confirmInvitationDto,
      token,
      response,
    );
  }

  @Patch('refresh-invitation')
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(ResponseInvitationDto))
  @Roles(['ADMIN', 'STAFF', 'UNIVERSITY_STAFF'])
  async updateInvitation(
    @Body() updateInvitationDto: CreateInvitationDto,
    @Req() request: UserInterceptorRequest,
  ) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return this.invitationService.updateInvitation(
      updateInvitationDto,
      request.user,
    );
  }
}
