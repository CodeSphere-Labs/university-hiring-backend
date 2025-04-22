import {
  IsString,
  IsInt,
  IsArray,
  IsDate,
  IsOptional,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePracticeDto {
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  groupId: number;

  @IsInt()
  @IsNotEmpty()
  organizationId: number;

  @IsInt()
  @IsNotEmpty()
  supervisorId: number;

  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  studentIds: number[];

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;
}
