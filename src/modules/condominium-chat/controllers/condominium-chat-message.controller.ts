import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

import { CondominiumChatMessageService } from '../services/condominium-chat-message.service';

@ApiTags('condominium-chat-message')
@Controller('condominium-chat-message')
export class CondominiumChatMessageController {
  constructor(
    private readonly condominiumChatMessageService: CondominiumChatMessageService,
  ) {}
}
