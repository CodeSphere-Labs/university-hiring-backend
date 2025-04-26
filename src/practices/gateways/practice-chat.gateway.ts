import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PracticeChatService } from '../practice-chat.service';
import { CreatePracticeChatMessageDto } from '../dto/create-practice-chat-message.dto';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  namespace: 'practice-chat',
  cors: {
    origin: '*',
  },
})
export class PracticeChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('PracticeChatGateway');

  constructor(
    private readonly chatService: PracticeChatService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.debug('WebSocket Gateway initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client Disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket) {
    try {
      const cookies = client.handshake.headers.cookie;

      if (!cookies) {
        client.disconnect();
        return;
      }

      const accessToken = cookies
        .split('; ')
        .find((cookie: string) => cookie.startsWith('access'))
        ?.split('=')[1];

      if (!accessToken) {
        client.disconnect();
        return;
      }

      try {
        const payload = await this.authService.validateToken(accessToken);

        client.data.userId = payload.sub;
        client.data.role = payload.role;
        this.logger.debug(
          `Client Connected: ${client.id}, User ID: ${payload.sub}`,
        );
      } catch {
        client.disconnect();
      }

      return 1;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('joinPracticeChat')
  async handleJoinPracticeChat(client: any, practiceId: string) {
    client.join(`practice:${practiceId}`);
    const messages = await this.chatService.getChatMessages(
      parseInt(practiceId),
    );

    return messages;
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: any,
    data: { practiceId: string; message: CreatePracticeChatMessageDto },
  ) {
    try {
      const cookies = client.handshake.headers.cookie;

      if (!cookies) {
        client.disconnect();
        return;
      }

      const accessToken = cookies
        .split('; ')
        .find((cookie: string) => cookie.startsWith('access'))
        ?.split('=')[1];

      const payload = await this.authService.validateToken(accessToken);

      client.data.userId = payload.sub;
      client.data.role = payload.role;

      const message = await this.chatService.createMessage(
        parseInt(data.practiceId),
        client.data.userId,
        data.message,
      );

      this.server.to(`practice:${data.practiceId}`).emit('newMessage', message);
      return message;
    } catch (error) {
      this.logger.error('Error sending message:', error);
    }
  }
}
