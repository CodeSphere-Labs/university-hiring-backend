import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddStudentToGroupRequestDto {
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @IsNotEmpty()
  @IsNumber()
  readonly groupId: number;
}
