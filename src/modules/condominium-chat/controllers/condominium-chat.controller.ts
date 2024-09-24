import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';

import { CondominiumChatService } from '../services/condominium-chat.service';

@ApiTags('condominium-chat')
@Controller('condominium-chat')
export class CondominiumChatController {
  constructor(
    private readonly condominiumChatService: CondominiumChatService,
  ) {}
}
