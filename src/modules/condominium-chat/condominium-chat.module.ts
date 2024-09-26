import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ENV_VARIABLES } from 'src/config/env.config';

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
  WsJwtGuard,
];

@Module({
  imports: [
    CondominiumMemberModule,
    JwtModule.register({
      secret: ENV_VARIABLES.JWT_SECRET,
      signOptions: {
        expiresIn: ENV_VARIABLES.JWT_EXPIRES_IN,
        audience: ENV_VARIABLES.JWT_AUDIENCE,
        issuer: ENV_VARIABLES.JWT_ISSUER,
      },
    }),
  ],
  controllers: [CondominiumChatController, CondominiumChatMessageController],
  providers,
  exports: providers,
})
export class CondominiumChatModule {}
