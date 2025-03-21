import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
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

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get('stats')
  @UseInterceptors(UserInterceptor)
  @Roles(['ADMIN', 'STAFF', 'UNIVERSITY_STAFF'])
  async getInvitationStats(@Req() request: UserInterceptorRequest) {
    return this.invitationService.getInvitationStats(request.user.id);
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
}
