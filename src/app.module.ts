import { Module } from '@nestjs/common';
import { OrganizationModule } from './organization/organization.module';
import { AuthModule } from 'src/auth/auth.module';
import { InvitationModule } from './invitation/invitation.module';
import { UserModule } from './user/user.module';
import { StudentsModule } from './students/students.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';

@Module({
  imports: [
    OrganizationModule,
    AuthModule,
    InvitationModule,
    UserModule,
    StudentsModule,
    OpportunitiesModule,
  ],
})
export class AppModule {}
