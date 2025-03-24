import { Role } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { OrganizationResponseDto } from 'src/organization/dto/organization.response.dto';

class CreatedByDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  role: Role;
}

@Exclude()
export class InvitationDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  role: Role;

  @Expose()
  used: boolean;

  @Expose()
  expiresAt: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  websiteUrl: string;

  @Expose()
  @Type(() => OrganizationResponseDto)
  organization: OrganizationResponseDto;

  @Expose()
  @Type(() => CreatedByDto)
  createdBy: CreatedByDto;
}

class Meta {
  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalItems: number;

  @Expose()
  totalPages: number;
}

@Exclude()
export class ResponseInvitationDto {
  @Expose()
  @Type(() => InvitationDto)
  data: InvitationDto;

  @Expose()
  @Type(() => Meta)
  meta: Meta;
}
