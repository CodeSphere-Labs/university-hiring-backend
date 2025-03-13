import { Module } from '@nestjs/common';
import { OrganizationModule } from './organization/organization.module';
import { AuthModule } from 'src/auth/auth.module';
import { InvitationModule } from './invitation/invitation.module';
import { UserModule } from './user/user.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { GroupsModule } from 'src/groups/groups.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from 'src/config';
import { SkillsModule } from './skills/skills.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
      load: [configuration],
      isGlobal: true,
    }),
    OrganizationModule,
    AuthModule,
    InvitationModule,
    UserModule,
    OpportunitiesModule,
    GroupsModule,
    EmailModule,
    SkillsModule,
    StudentModule,
  ],
})
export class AppModule {}
