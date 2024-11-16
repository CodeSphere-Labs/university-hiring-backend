import { Module } from '@nestjs/common';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { PrismaService } from 'src/database/prisma.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [InvitationController],
  providers: [InvitationService, PrismaService, AuthService],
})
export class InvitationModule {}
