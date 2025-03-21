import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateInvitationDto } from './dto/CreateInvitation.dto';
import { AuthService } from 'src/auth/auth.service';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { ConfirmInvitationDto } from 'src/invitation/dto/ConfirmInvitation.dto';
import { EmailService } from 'src/email/email.service';
import { ErrorCodes } from 'src/common/enums/error-codes';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  async createInvitation(invitationDto: CreateInvitationDto, userId: number) {
    const token = await this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    if (invitationDto.role === Role.STUDENT) {
      if (!invitationDto.groupId) {
        throw new HttpException(
          ErrorCodes['GROUP_REQUIRED'],
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingGroup = await this.prisma.group.findUnique({
        where: { id: invitationDto.groupId },
      });

      if (!existingGroup) {
        throw new HttpException(
          ErrorCodes['GROUP_NOT_FOUND'],
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const existingInvitation = await this.prisma.invitation.findFirst({
      where: { email: invitationDto.email },
    });

    if (existingInvitation) {
      throw new HttpException(
        ErrorCodes['USER_ALREADY_INVITED'],
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingOrganization = await this.prisma.organization.findUnique({
      where: {
        id: invitationDto.organizationId,
      },
    });

    if (!existingOrganization) {
      throw new HttpException(
        ErrorCodes['ORGANIZATION_NOT_FOUND'],
        HttpStatus.NOT_FOUND,
      );
    }

    const invite = await this.prisma.invitation.create({
      data: {
        ...invitationDto,
        token,
        expiresAt,
        createdById: userId,
      },
    });

    await this.emailService.sendInvitationMail(
      invitationDto.email,
      invite.token,
    );

    return { inviteToken: invite.token, message: 'Email send' };
  }

  async confirmInvitation(
    confirmInvitationDto: ConfirmInvitationDto,
    token: string,
    response: Response,
  ) {
    const invitation = await this.verifyInvitationToken(token);

    const user = await this.registerUser(
      confirmInvitationDto,
      invitation,
      response,
    );

    const updatedUser = await this.addUserToOrganization(
      user.id,
      invitation.organizationId,
    );

    await this.deleteInvitation(invitation.id);

    return updatedUser;
  }

  async getInvitationStats(userId: number) {
    const totalInvitations = await this.prisma.invitation.count({
      where: { createdById: userId },
    });

    const acceptedInvitations = await this.prisma.invitation.count({
      where: { createdById: userId, used: true },
    });

    const pendingInvitations = await this.prisma.invitation.count({
      where: {
        createdById: userId,
        used: false,
        expiresAt: { gte: new Date() },
      },
    });
    const expiredInvitations = await this.prisma.invitation.count({
      where: {
        createdById: userId,
        used: false,
        expiresAt: { lt: new Date() },
      },
    });

    return [
      {
        label: 'Все приглашения',
        stats: totalInvitations,
        color: 'blue',
        icon: 'all',
      },
      {
        label: 'Принятые приглашения',
        stats: acceptedInvitations,
        color: 'teal',
        icon: 'accept',
      },
      {
        label: 'В ожидании',
        stats: pendingInvitations,
        color: 'gray',
        icon: 'wait',
      },
      {
        label: 'Истекшие приглашения',
        stats: expiredInvitations,
        color: 'red',
        icon: 'expired',
      },
    ];
  }

  private async verifyInvitationToken(token: string) {
    try {
      const invitation = await this.prisma.invitation.findUnique({
        where: { token },
      });

      if (!invitation) {
        throw new HttpException(
          ErrorCodes['INVALID_INVITATION'],
          HttpStatus.BAD_REQUEST,
        );
      }

      if (invitation.used) {
        throw new HttpException(
          ErrorCodes['INVINTATION_USED'],
          HttpStatus.BAD_REQUEST,
        );
      }

      if (invitation.expiresAt < new Date()) {
        this.deleteInvitation(invitation.id);
        throw new HttpException(
          ErrorCodes['INVINTATION_EXPIRED'],
          HttpStatus.NOT_FOUND,
        );
      }

      return invitation;
    } catch {
      throw new HttpException(
        ErrorCodes['INVALID_INVITATION'],
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async registerUser(
    user: SignUpDto,
    invintation: CreateInvitationDto,
    response: Response,
  ) {
    return await this.authService.signUp(user, invintation, response);
  }

  private async addUserToOrganization(userId: number, organizationId: number) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { organizationId },
    });
  }

  private async deleteInvitation(invitationId: number) {
    await this.prisma.invitation.delete({ where: { id: invitationId } });
  }

  private async generateToken() {
    return randomUUID();
  }
}
