import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { PrismaService } from 'src/database/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [InvitationController],
  providers: [InvitationService, PrismaService, AuthService, EmailService],
})
export class InvitationModule {}
