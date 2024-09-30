import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';

import { WsJwtGuard } from './guards/ws-jwt.guard';
import {
  CondominiumChatMessageProcessor,
  CONDOMINIUM_CHAT_MESSAGE_PROCESSOR,
} from './processors/condominium-chat-message.processor';
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
  WsJwtGuard,
  CondominiumChatMessageProcessor,
];

@Module({
  imports: [
    CondominiumMemberModule,
    JwtModule,
    BullModule.registerQueue({
      name: CONDOMINIUM_CHAT_MESSAGE_PROCESSOR,
    }),
  ],
  controllers: [CondominiumChatController, CondominiumChatMessageController],
  providers,
  exports: providers,
})
export class CondominiumChatModule {}
