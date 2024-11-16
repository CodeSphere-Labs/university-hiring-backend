import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateInvitationDto } from './dto/CreateInvitation.dto';
import { AuthService } from 'src/auth/auth.service';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class InvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async createInvitation(invitationDto: CreateInvitationDto) {
    const token = await this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const invite = await this.prisma.invitation.create({
      data: {
        email: invitationDto.email,
        role: invitationDto.role,
        organizationId: invitationDto.organizationId,
        token,
        expiresAt,
      },
    });

    return { inviteToken: invite.token };
  }

  async verifyInvitationToken(token: string) {
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

  async registerUser(user: SignUpDto, role: Role, response: Response) {
    return await this.authService.signUp(user, role, response);
  }

  async addUserToOrganization(userId: number, organizationId: number) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { organizationId },
    });
  }

  async deleteInvitation(invitationId: number) {
    await this.prisma.invitation.delete({ where: { id: invitationId } });
  }

  private async generateToken() {
    return randomUUID();
  }
}
