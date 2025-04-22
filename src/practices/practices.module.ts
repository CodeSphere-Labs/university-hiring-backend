import { Module } from '@nestjs/common';
import { PracticesService } from './practices.service';
import { PracticesController } from './practices.controller';
import { PrismaService } from 'src/database/prisma.service';
import { PracticeChatService } from './practice-chat.service';
import { PracticeChatController } from './practice-chat.controller';
import { PracticeChatGateway } from './gateways/practice-chat.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PracticesController, PracticeChatController],
  providers: [
    PracticesService,
    PrismaService,
    PracticeChatService,
    PracticeChatGateway,
  ],
})
export class PracticesModule {}
