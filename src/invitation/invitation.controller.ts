import {
  Body,
  Controller,
  Post,
  Query,
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

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('create-invitation')
  @Roles(['ADMIN', 'STAFF', 'UNIVERSITY_STAFF'])
  async createStaffInvitation(@Body() invitationDto: CreateInvitationDto) {
    return this.invitationService.createInvitation(invitationDto);
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
