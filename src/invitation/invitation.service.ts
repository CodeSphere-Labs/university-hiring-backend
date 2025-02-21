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

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  async createInvitation(invitationDto: CreateInvitationDto) {
    const token = await this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    if (invitationDto.role === Role.STUDENT) {
      if (!invitationDto.groupId) {
        throw new HttpException('Group id is required', HttpStatus.BAD_REQUEST);
      }

      const existingGroup = await this.prisma.group.findUnique({
        where: { id: invitationDto.groupId },
      });

      if (!existingGroup) {
        throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
      }
    }

    const existingInvitation = await this.prisma.invitation.findFirst({
      where: { email: invitationDto.email },
    });

    if (existingInvitation) {
      throw new HttpException('User already invited', HttpStatus.BAD_REQUEST);
    }

    const existingOrganization = await this.prisma.organization.findUnique({
      where: {
        id: invitationDto.organizationId,
      },
    });

    if (!existingOrganization) {
      throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
    }

    const invite = await this.prisma.invitation.create({
      data: {
        ...invitationDto,
        token,
        expiresAt,
      },
    });

    await this.emailService.sendInvitationMail(
      'nekit.nik2018@yandex.ru',
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

  private async verifyInvitationToken(token: string) {
    try {
      const invitation = await this.prisma.invitation.findUnique({
        where: { token },
      });

      if (!invitation) {
        throw new HttpException('Invalid invitation', HttpStatus.BAD_REQUEST);
      }

      if (invitation.used) {
        throw new HttpException(
          'Invitation already used',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (invitation.expiresAt < new Date()) {
        this.deleteInvitation(invitation.id);
        throw new HttpException('Invitation epired', HttpStatus.NOT_FOUND);
      }

      return invitation;
    } catch {
      throw new HttpException(
        'Invalid or expired invitation',
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
