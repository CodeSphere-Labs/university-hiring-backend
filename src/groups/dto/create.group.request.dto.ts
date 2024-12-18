import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupRequestDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;
}
