import { Module } from '@nestjs/common';
import { OrganizationModule } from './organization/organization.module';
import { AuthModule } from 'src/auth/auth.module';
import { InvitationModule } from './invitation/invitation.module';

@Module({
  imports: [OrganizationModule, AuthModule, InvitationModule],
})
export class AppModule {}
