import { Module } from '@nestjs/common';
import { OrganizationModule } from './organization/organization.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [OrganizationModule, AuthModule],
})
export class AppModule {}
