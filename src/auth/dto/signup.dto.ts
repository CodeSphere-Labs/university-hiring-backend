import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;

  @IsBoolean()
  @ApiProperty()
  isStudent?: boolean;

  @IsBoolean()
  @ApiProperty()
  isCompany?: boolean;
}
