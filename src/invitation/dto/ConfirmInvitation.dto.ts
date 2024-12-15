import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';

export class ConfirmInvitationDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  patronymic: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
