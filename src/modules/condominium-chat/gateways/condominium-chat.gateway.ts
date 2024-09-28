import {
  MessageBody,
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  type OnGatewayInit,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { corsConfig } from 'src/config/cors.config';
import { LogService } from 'src/lib/log/log.service';
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
import { CondominiumChatMessageService } from '../services/condominium-chat-message.service';

type GatewayMethods = OnGatewayConnection & OnGatewayDisconnect & OnGatewayInit;

@WebSocketGateway({
  namespace: '/server/condominium-chat',
  cors: { origin: corsConfig.allowedWsDomains },
  transports: ['websocket', 'polling'],
})
export class CondominiumChatGateway implements GatewayMethods {
  constructor(
    private readonly condominiumChatMessageService: CondominiumChatMessageService,
    private readonly logService: LogService,
  ) {}

  @WebSocketServer()
  readonly server: Server;

  afterInit() {
    this.logService.logger?.debug('Socket initialized');
  }

  async handleConnection(client: Socket) {
    const decodedToken = client.data[DECODED_TOKEN_KEY] as DecodedTokenType;

    this.logService.logger?.log(
      `Client connected: ${client.id}, User ${decodedToken?.id} connected`,
    );
  }

  handleDisconnect(client: Socket) {
    const decodedToken = client.data[DECODED_TOKEN_KEY] as DecodedTokenType;

    this.logService.logger?.warn(`User ${decodedToken.id} disconnected`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, condominium_chat_id: string) {
    client.join(condominium_chat_id);

    this.server
      .to(condominium_chat_id)
      .emit('user-joined', { userId: client.id });

    this.logService.logger?.log(
      `User ${client.id} joined room ${condominium_chat_id}`,
    );
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, condominium_chat_id: string) {
    client.leave(condominium_chat_id);

    this.server
      .to(condominium_chat_id)
      .emit('user-left', { userId: client.id });

    this.logService.logger?.log(
      `User ${client.id} left room ${condominium_chat_id}`,
    );
  }

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
