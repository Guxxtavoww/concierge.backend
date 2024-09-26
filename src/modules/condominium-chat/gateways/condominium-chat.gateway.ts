import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { corsConfig } from 'src/config/cors.config';
import { LogService } from 'src/lib/log/log.service';
import { ENV_VARIABLES } from 'src/config/env.config';
import { DECODED_TOKEN_KEY } from 'src/shared/decorators/decoded-token.decorator';

import { UseZodPipe } from '../pipes/zod.pipe';
import {
  createCondominiumChatMessageSchema,
  type CreateCondominiumChatMessageType,
} from '../dtos/condominium-chat-message/create.dto';
import {
  updateCondominiumChatMessageSchema,
  type UpdateCondominiumChatMessageType,
} from '../dtos/condominium-chat-message/update.dto';
import {
  deleteChatMessageSchema,
  type DeleteChatMessageType,
} from '../dtos/condominium-chat-message/delete.dto';
import { UseWsJwtGuard } from '../guards/ws-jwt.guard';
import { CondominiumChatMessageService } from '../services/condominium-chat-message.service';

@WebSocketGateway(ENV_VARIABLES.WEBSOCKET_PORT, {
  cors: {
    origin: corsConfig.allowedDomains,
  },
  path: '/condominium-chat',
})
export class CondominiumChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly logService: LogService,
    private readonly condominiumChatMessageService: CondominiumChatMessageService,
  ) {}

  @WebSocketServer()
  readonly server: Server;

  @UseWsJwtGuard()
  async handleConnection(client: Socket) {
    const decodedToken = client.data[DECODED_TOKEN_KEY] as DecodedTokenType;

    this.logService.logger?.log(`User ${decodedToken.id} connected`, {
      socket_id: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    const decodedToken = client.data[DECODED_TOKEN_KEY] as DecodedTokenType;

    this.logService.logger?.warn(`User ${decodedToken.id} disconnected`);
  }

  @UseWsJwtGuard()
  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    this.server.to(roomId).emit('user-joined', { userId: client.id });
    this.logService.logger?.log(`User ${client.id} joined room ${roomId}`);
  }

  @UseWsJwtGuard()
  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, roomId: string) {
    client.leave(roomId);
    this.server.to(roomId).emit('user-left', { userId: client.id });
    this.logService.logger?.log(`User ${client.id} left room ${roomId}`);
  }

  @UseWsJwtGuard()
  @UseZodPipe(createCondominiumChatMessageSchema)
  @SubscribeMessage('send-message')
  async handleSendMessage(
    _client: Socket,
    @MessageBody() payload: CreateCondominiumChatMessageType,
  ) {
    const roomId = payload.condominium_chat_id;

    const message =
      await this.condominiumChatMessageService.sendMessage(payload);

    this.server.to(roomId).emit('receive-message', message);

    return message;
  }

  @UseWsJwtGuard()
  @UseZodPipe(updateCondominiumChatMessageSchema)
  @SubscribeMessage('update-message')
  async handleUpdateMessage(
    _client: Socket,
    @MessageBody() payload: UpdateCondominiumChatMessageType,
  ) {
    const message =
      await this.condominiumChatMessageService.updateMessage(payload);

    return message;
  }

  @UseWsJwtGuard()
  @UseZodPipe(deleteChatMessageSchema)
  @SubscribeMessage('delete-message')
  async handleDeleteMessage(
    _client: Socket,
    @MessageBody() payload: DeleteChatMessageType,
  ) {
    const message =
      await this.condominiumChatMessageService.deleteMessage(payload);

    return message;
  }
}
