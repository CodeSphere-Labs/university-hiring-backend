import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePracticeChatMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
