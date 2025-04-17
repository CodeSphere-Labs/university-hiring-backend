import { IsString, IsOptional, IsDate, IsNumber } from 'class-validator';

export class CreatePracticeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsNumber()
  groupId: number;

  @IsNumber()
  universityId: number;

  @IsNumber()
  organizationId: number;

  @IsNumber()
  createdById: number;
}
