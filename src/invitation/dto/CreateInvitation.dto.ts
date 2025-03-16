import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInvitationDto {
  @IsNumber()
  @IsNotEmpty()
  readonly organizationId: number;

  @IsOptional()
  @IsNumber()
  readonly groupId: number;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsEnum(Role)
  readonly role: Role;
}
