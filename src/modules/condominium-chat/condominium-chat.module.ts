import { Module } from '@nestjs/common';

import { CondominiumChatService } from './services/condominium-chat.service';
import { CondominiumChatController } from './controllers/condominium-chat.controller';
import { CondominiumMemberModule } from '../condominium-member/condominium-member.module';
import { CondominiumChatMessageService } from './services/condominium-chat-message.service';
import { CondominiumChatMessageController } from './controllers/condominium-chat-message.controller';

const providers = [CondominiumChatService, CondominiumChatMessageService];

@Module({
  imports: [CondominiumMemberModule],
  controllers: [CondominiumChatController, CondominiumChatMessageController],
  providers,
  exports: providers,
})
export class CondominiumChatModule {}
