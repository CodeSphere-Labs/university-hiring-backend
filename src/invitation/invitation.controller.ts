import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Roles } from 'src/common/guards/role.guard';
import { InvitationService } from './invitation.service';
import { CreateInvitationDto } from './dto/CreateInvitation.dto';
import { ConfirmInvitationDto } from 'src/invitation/dto/ConfirmInvitation.dto';
import type { Response } from 'express';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('create-invitation')
  @Roles(['ADMIN', 'STAFF'])
  async createStaffInvitation(@Body() invitationDto: CreateInvitationDto) {
    return this.invitationService.createInvitation(invitationDto);
  }

  @Post('confirm-invitation')
  async confirmRegisration(
    @Body() confirmInvitation: ConfirmInvitationDto,
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const invitation =
        await this.invitationService.verifyInvitationToken(token);

      const user = await this.invitationService.registerUser(
        confirmInvitation,
        invitation.role,
        response,
      );

      const updatedUser = await this.invitationService.addUserToOrganization(
        user.id,
        invitation.organizationId,
      );

      await this.invitationService.deleteInvitation(invitation.id);

      return updatedUser;
    } catch {
      throw new HttpException('Registration failed', HttpStatus.BAD_REQUEST);
    }
  }
}
