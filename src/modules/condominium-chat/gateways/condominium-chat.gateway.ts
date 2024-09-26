import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { corsConfig } from 'src/config/cors.config';

import { WsJwtGuard } from '../guards/ws-jwt.guard';

@WebSocketGateway({
  cors: corsConfig.allowedDomains,
  path: '/condominium-chat',
})
export class CondominiumChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  readonly server: Server;

  @UseGuards(WsJwtGuard)
  handleConnection(client: Socket, ...args: any[]) {}

  handleDisconnect(client: Socket) {}
}
