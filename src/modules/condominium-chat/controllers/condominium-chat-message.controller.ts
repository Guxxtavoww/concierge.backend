import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';

import { CondominiumChatMessageService } from '../services/condominium-chat-message.service';
import { PaginateCondominiumChatMessagesDTO } from '../dtos/condominium-chat-message/paginate.dto';

@ApiTags('condominium-chat-message')
@Controller('condominium-chat-message')
export class CondominiumChatMessageController {
  constructor(
    private readonly condominiumChatMessageService: CondominiumChatMessageService,
  ) {}

  @Get('paginate')
  paginate(@Query() queries: PaginateCondominiumChatMessagesDTO) {
    return this.condominiumChatMessageService.paginateChatMessages(queries);
  }
}
