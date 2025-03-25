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
import { UserInterceptorResponse } from 'src/common/interceptors/user.interceptor';

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

    const expired =
      existingInvitation && existingInvitation.expiresAt < new Date();

    if (existingInvitation && expired) {
      throw new HttpException(
        ErrorCodes['INVINTATION_EXPIRED'],
        HttpStatus.NOT_FOUND,
      );
    }

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

  async getInvitationStats(
    user: UserInterceptorResponse,
    filter: 'createdByMe' | 'all',
  ) {
    if (filter === 'all') {
      if (user.role !== Role.ADMIN) {
        throw new HttpException(ErrorCodes['FORBIDDEN'], HttpStatus.FORBIDDEN);
      }

      return this.getInvitationStatsForAdmin();
    }

    return this.getInvitationStatsForUser(user.id);
  }

  async updateInvitation(
    updateInvitationDto: CreateInvitationDto,
    user: UserInterceptorResponse,
  ) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { email: updateInvitationDto.email },
    });

    if (!invitation) {
      throw new HttpException(
        ErrorCodes['INVITATION_NOT_FOUND'],
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.role !== Role.ADMIN && invitation.createdById !== user.id) {
      throw new HttpException(ErrorCodes['FORBIDDEN'], HttpStatus.FORBIDDEN);
    }

    if (invitation.used) {
      throw new HttpException(
        ErrorCodes['INVINTATION_USED'],
        HttpStatus.BAD_REQUEST,
      );
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const updatedInvitation = await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        email: updateInvitationDto.email,
        role: updateInvitationDto.role,
        organizationId: updateInvitationDto.organizationId,
        groupId: updateInvitationDto.groupId,
        expiresAt,
      },
      include: {
        organization: true,
        group: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await this.emailService.sendInvitationMail(
      updateInvitationDto.email,
      updatedInvitation.token,
    );

    return { message: 'Email send' };
  }

  async updateInvitationById(id: number, user: UserInterceptorResponse) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id },
    });

    if (!invitation) {
      throw new HttpException(
        ErrorCodes['INVITATION_NOT_FOUND'],
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.role !== Role.ADMIN && invitation.createdById !== user.id) {
      throw new HttpException(ErrorCodes['FORBIDDEN'], HttpStatus.FORBIDDEN);
    }

    if (invitation.used) {
      throw new HttpException(
        ErrorCodes['INVINTATION_USED'],
        HttpStatus.BAD_REQUEST,
      );
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const updatedInvitation = await this.prisma.invitation.update({
      where: { id },
      data: {
        expiresAt,
      },
      include: {
        organization: true,
        group: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    await this.emailService.sendInvitationMail(
      updatedInvitation.email,
      updatedInvitation.token,
    );

    return updatedInvitation;
  }

  async deleteInvitationById(id: number, user: UserInterceptorResponse) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      include: {
        organization: true,
        group: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new HttpException(
        ErrorCodes['INVITATION_NOT_FOUND'],
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.role !== Role.ADMIN && invitation.createdById !== user.id) {
      throw new HttpException(ErrorCodes['FORBIDDEN'], HttpStatus.FORBIDDEN);
    }

    const deletedInvitation = await this.prisma.invitation.delete({
      where: { id },
      include: {
        organization: true,
        group: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return deletedInvitation;
  }

  private async getInvitationStatsForUser(userId: number) {
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
        status: 'all',
      },
      {
        label: 'Принятые приглашения',
        stats: acceptedInvitations,
        color: 'teal',
        status: 'accept',
      },
      {
        label: 'В ожидании',
        stats: pendingInvitations,
        color: 'gray',
        status: 'wait',
      },
      {
        label: 'Истекшие приглашения',
        stats: expiredInvitations,
        color: 'red',
        status: 'expired',
      },
    ];
  }

  async getInvitations(
    user: UserInterceptorResponse,
    filter: 'createdByMe' | 'all' = 'createdByMe',
    status: 'all' | 'accept' | 'wait' | 'expired' = 'all',
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    if (filter === 'all' && user.role !== Role.ADMIN) {
      throw new HttpException(ErrorCodes['FORBIDDEN'], HttpStatus.FORBIDDEN);
    }

    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    if (filter === 'createdByMe') {
      whereCondition.createdById = user.id;
    }

    if (search) {
      whereCondition.email = {
        contains: search,
        mode: 'insensitive',
      };
    }

    switch (status) {
      case 'accept':
        whereCondition.used = true;
        break;
      case 'wait':
        whereCondition.used = false;
        whereCondition.expiresAt = { gte: new Date() };
        break;
      case 'expired':
        whereCondition.used = false;
        whereCondition.expiresAt = { lt: new Date() };
        break;
    }

    const invitations = await this.prisma.invitation.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        organization: true,
        group: true,
        ...(filter === 'all' && {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        }),
      },
    });

    const total = await this.prisma.invitation.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: invitations,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages,
      },
    };
  }

  private async getInvitationStatsForAdmin() {
    const totalInvitations = await this.prisma.invitation.count();

    const acceptedInvitations = await this.prisma.invitation.count({
      where: { used: true },
    });

    const pendingInvitations = await this.prisma.invitation.count({
      where: {
        used: false,
        expiresAt: { gte: new Date() },
      },
    });

    const expiredInvitations = await this.prisma.invitation.count({
      where: {
        used: false,
        expiresAt: { lt: new Date() },
      },
    });

    return [
      {
        label: 'Все приглашения',
        stats: totalInvitations,
        color: 'blue',
        status: 'all',
      },
      {
        label: 'Принятые приглашения',
        stats: acceptedInvitations,
        color: 'teal',
        status: 'accept',
      },
      {
        label: 'В ожидании',
        stats: pendingInvitations,
        color: 'gray',
        status: 'wait',
      },
      {
        label: 'Истекшие приглашения',
        stats: expiredInvitations,
        color: 'red',
        status: 'expired',
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
