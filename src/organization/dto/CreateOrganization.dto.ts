import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  readonly name?: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email?: string;

  @IsNotEmpty()
  @IsString()
  readonly about?: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  readonly websiteUrl?: string;
}
