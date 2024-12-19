import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class GetAllUsersDto {
  @IsOptional()
  @IsEnum(Role, { message: 'Role must be one of STUDENT, STAFF, ADMIN' })
  role?: Role;

  @IsOptional()
  organizationId?: number;

  @IsOptional()
  firstName?: string;
}
