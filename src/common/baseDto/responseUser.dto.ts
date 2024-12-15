import { Exclude, Expose, Type } from 'class-transformer';
import { Role } from '@prisma/client';
import { OrganizationResponseDto } from 'src/organization/dto/organization.response.dto';
import { ResponseStudentProfileDto } from 'src/common/baseDto/responseStudentProfile.dto';

@Exclude()
export class ResponseUserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  patronymic: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  aboutMe: string;

  @Expose()
  telegramLink: string;

  @Expose()
  vkLink: string;

  @Expose()
  role: Role;

  @Expose()
  @Type(() => OrganizationResponseDto)
  organization: OrganizationResponseDto;

  @Expose()
  @Type(() => ResponseStudentProfileDto)
  studentProfile?: ResponseStudentProfileDto;
}
