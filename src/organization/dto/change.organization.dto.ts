import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class ChangeOrganizationDto {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly logoUrl: string;

  @IsOptional()
  @IsString()
  readonly about: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  readonly websiteUrl: string;
}
