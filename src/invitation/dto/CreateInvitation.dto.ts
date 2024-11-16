import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

enum Role {
  STAFF = 'STAFF',
  STUDENT = 'STUDENT',
}

export class CreateInvitationDto {
  @IsOptional()
  @IsNumber()
  readonly organizationId: number;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsEnum(Role)
  readonly role: Role;
}
