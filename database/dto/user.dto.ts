import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly first_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly last_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly patronymic: string;

  @IsEmail()
  @IsString()
  @ApiProperty()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly password: string;
}
