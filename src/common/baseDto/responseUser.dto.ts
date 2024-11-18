import { Exclude, Expose } from 'class-transformer';
import { Role } from '@prisma/client';

@Exclude()
export class ResponseUserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  role: Role;

  @Expose()
  organizationId: number;
}
