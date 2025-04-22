import { Injectable } from '@nestjs/common';
import { CreatePracticeChatMessageDto } from './dto/create-practice-chat-message.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PracticeChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getChatMessages(practiceId: number) {
    const chat = await this.prisma.practiceChat.findUnique({
      where: { practiceId },
    });

    if (!chat) {
      return [];
    }

    return this.prisma.practiceChatMessage.findMany({
      where: { chatId: chat.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createMessage(
    practiceId: number,
    userId: number,
    createMessageDto: CreatePracticeChatMessageDto,
  ) {
    let chat = await this.prisma.practiceChat.findUnique({
      where: { practiceId },
    });

    if (!chat) {
      chat = await this.prisma.practiceChat.create({
        data: { practiceId },
      });
    }

    return this.prisma.practiceChatMessage.create({
      data: {
        content: createMessageDto.content,
        chatId: chat.id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}
