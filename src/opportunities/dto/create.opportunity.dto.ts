import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOpportunityDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly skillIds: number[];
}
