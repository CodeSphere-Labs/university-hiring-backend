import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { PracticeChatService } from './practice-chat.service';
import { CreatePracticeChatMessageDto } from './dto/create-practice-chat-message.dto';
import { Roles } from 'src/common/guards/role.guard';
import {
  UserInterceptor,
  UserInterceptorRequest,
} from 'src/common/interceptors/user.interceptor';

@Controller('practices/:practiceId/chat')
@UseInterceptors(UserInterceptor)
export class PracticeChatController {
  constructor(private readonly practiceChatService: PracticeChatService) {}

  @Get()
  @Roles(['ADMIN', 'UNIVERSITY_STAFF', 'STAFF', 'STUDENT'])
  getMessages(@Param('practiceId', ParseIntPipe) practiceId: number) {
    return this.practiceChatService.getChatMessages(practiceId);
  }

  @Post()
  @Roles(['ADMIN', 'UNIVERSITY_STAFF', 'STAFF', 'STUDENT'])
  createMessage(
    @Param('practiceId', ParseIntPipe) practiceId: number,
    @Body() createMessageDto: CreatePracticeChatMessageDto,
    @Req() request: UserInterceptorRequest,
  ) {
    return this.practiceChatService.createMessage(
      request.user.id,
      practiceId,
      createMessageDto,
    );
  }
}
