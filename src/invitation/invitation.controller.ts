import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import {
  InvitationDto,
  ResponseInvitationDto,
} from './dto/ResponseInvitationDto';

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
    @Query('search') search?: string,
  ) {
    return this.invitationService.getInvitations(
      request.user,
      filter,
      status,
      page,
      limit,
      search,
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
  @Roles(['ADMIN', 'STAFF', 'UNIVERSITY_STAFF'])
  async updateInvitation(
    @Body() updateInvitationDto: CreateInvitationDto,
    @Req() request: UserInterceptorRequest,
  ) {
    return this.invitationService.updateInvitation(
      updateInvitationDto,
      request.user,
    );
  }

  @Patch('refresh-invitation/:id')
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(InvitationDto))
  @Roles(['ADMIN', 'STAFF', 'UNIVERSITY_STAFF'])
  async updateInvitationById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserInterceptorRequest,
  ) {
    return this.invitationService.updateInvitationById(id, request.user);
  }

  @Delete(':id')
  @UseInterceptors(UserInterceptor)
  @UseInterceptors(new TransformDataInterceptor(InvitationDto))
  @Roles(['ADMIN', 'STAFF', 'UNIVERSITY_STAFF'])
  async deleteInvitation(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: UserInterceptorRequest,
  ) {
    return this.invitationService.deleteInvitationById(id, request.user);
  }
}
