import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  readonly patronymic: string;

  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsOptional()
  @IsUrl()
  readonly avatarUrl?: string;

  @IsOptional()
  @IsString()
  readonly resume?: string;

  @IsOptional()
  @IsString()
  readonly aboutMe?: string;

  @IsOptional()
  @IsString()
  readonly telegramLink?: string;

  @IsOptional()
  @IsString()
  readonly vkLink?: string;

  @IsOptional()
  @IsUrl()
  readonly githubLink?: string;

  @IsOptional()
  readonly group?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PetProjectDto)
  readonly projects?: PetProjectDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

export class PetProjectDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  readonly githubUrl: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  readonly websiteUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly technologies?: string[];
}
