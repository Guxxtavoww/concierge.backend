import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

import { WsJwtGuard } from './guards/ws-jwt.guard';
import { CondominiumChatService } from './services/condominium-chat.service';
import { CondominiumChatGateway } from './gateways/condominium-chat.gateway';
import { CondominiumChatController } from './controllers/condominium-chat.controller';
import { CondominiumMemberModule } from '../condominium-member/condominium-member.module';
import { CondominiumChatMessageService } from './services/condominium-chat-message.service';
import { CondominiumChatMessageController } from './controllers/condominium-chat-message.controller';

const providers = [
  CondominiumChatService,
  CondominiumChatMessageService,
  CondominiumChatGateway,
];

@Module({
  imports: [CondominiumMemberModule, JwtModule],
  controllers: [CondominiumChatController, CondominiumChatMessageController],
  providers: [...providers, { provide: APP_GUARD, useClass: WsJwtGuard }],
  exports: providers,
})
export class CondominiumChatModule {}
