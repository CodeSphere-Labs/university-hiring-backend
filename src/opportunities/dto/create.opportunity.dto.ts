import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateOpportunityDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  readonly skills: string[];
}
