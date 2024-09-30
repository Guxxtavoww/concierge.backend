import {
  MessageBody,
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  type OnGatewayInit,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Queue } from 'bull';
import { Server, Socket } from 'socket.io';
import { InjectQueue } from '@nestjs/bull';

import { corsConfig } from 'src/config/cors.config';
import { LogService } from 'src/lib/log/log.service';
import { DECODED_TOKEN_KEY } from 'src/shared/decorators/decoded-token.decorator';

import { UseZodPipe } from '../pipes/zod.pipe';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
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
import {
  CONDOMINIUM_CHAT_MESSAGE_PROCESSOR,
  CONDOMINIUM_CHAT_MESSAGE_KEYS,
} from '../processors/condominium-chat-message.processor';

type GatewayMethods = OnGatewayConnection & OnGatewayDisconnect & OnGatewayInit;

@WebSocketGateway({
  namespace: '/server/condominium-chat',
  cors: { origin: corsConfig.allowedWsDomains },
  transports: ['websocket', 'polling'],
})
export class CondominiumChatGateway implements GatewayMethods {
  constructor(
    private readonly logService: LogService,
    private readonly wsJwtGuard: WsJwtGuard,
    @InjectQueue(CONDOMINIUM_CHAT_MESSAGE_PROCESSOR)
    private condominiumChatMessageQueue: Queue,
  ) {}

  @WebSocketServer()
  readonly server: Server;

  afterInit() {
    this.logService.logger?.debug('Socket initialized');
  }

  async handleConnection(client: Socket) {
    const decodedToken = await this.wsJwtGuard.auth(client);

    this.logService.logger?.log(`User ${decodedToken.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.logService.logger?.warn(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, condominium_chat_id: string) {
    client.join(condominium_chat_id);

    const user_id = (client.data[DECODED_TOKEN_KEY] as DecodedTokenType).id

    this.server
      .to(condominium_chat_id)
      .emit('user-joined', { user_id });

    this.logService.logger?.log(
      `User ${user_id} joined room ${condominium_chat_id}`,
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

    const message = await this.condominiumChatMessageQueue.add(
      CONDOMINIUM_CHAT_MESSAGE_KEYS.SEND,
      payload,
    );

    this.server.to(roomId).emit('receive-message', message.data);

    return message.data;
  }

  @UseZodPipe(updateCondominiumChatMessageSchema)
  @SubscribeMessage('update-message')
  async handleUpdateMessage(
    _client: Socket,
    @MessageBody() payload: UpdateCondominiumChatMessageType,
  ) {
    const message = await this.condominiumChatMessageQueue.add(
      CONDOMINIUM_CHAT_MESSAGE_KEYS.UPDATE,
      payload,
    );

    return message.data;
  }

  @UseZodPipe(deleteChatMessageSchema)
  @SubscribeMessage('delete-message')
  async handleDeleteMessage(
    _client: Socket,
    @MessageBody() payload: DeleteChatMessageType,
  ) {
    const message = await this.condominiumChatMessageQueue.add(
      CONDOMINIUM_CHAT_MESSAGE_KEYS.DELETE,
      payload,
    );

    return message.data;
  }
}
