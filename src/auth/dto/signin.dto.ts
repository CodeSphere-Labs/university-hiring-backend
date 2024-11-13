import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
