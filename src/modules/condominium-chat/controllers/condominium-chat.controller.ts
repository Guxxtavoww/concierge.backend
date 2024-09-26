import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UuidParam } from 'src/shared/decorators/uuid-param.decorator';
import { DecodedToken } from 'src/shared/decorators/decoded-token.decorator';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination-query.decorator';

import {
  RemoveCondominiumChatMemberDTO,
  RemoveCondominiumChatMemberSwagger,
} from '../dtos/condominium-chat/remove-members.dto';
import { CondominiumChatService } from '../services/condominium-chat.service';
import { CreateCondominiumChatDTO } from '../dtos/condominium-chat/create.dto';
import { UpdateCondominiumChatDTO } from '../dtos/condominium-chat/update.dto';
import { PaginateCondominiumChatsDTO } from '../dtos/condominium-chat/paginate.dto';

@ApiTags('condominium-chat')
@Controller('condominium-chat')
export class CondominiumChatController {
  constructor(
    private readonly condominiumChatService: CondominiumChatService,
  ) {}

  @ApiPaginationQuery()
  @Get('paginate')
  paginate(@Query() querys: PaginateCondominiumChatsDTO) {
    return this.condominiumChatService.paginateCondominiumChats(querys);
  }

  @Get(':id')
  getOne(@UuidParam('id') id: string) {
    return this.condominiumChatService.getCondominiumChatById(id);
  }

  @Post(':condominium_id')
  create(
    @UuidParam('condominium_id') condominium_id: string,
    @Body() payload: CreateCondominiumChatDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumChatService.createCondominiumChat(
      condominium_id,
      payload,
      decoded_token.id,
    );
  }

  @Put(':chat_id')
  update(
    @UuidParam('chat_id') chat_id: string,
    @Body() payload: UpdateCondominiumChatDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumChatService.updateCondominiumChat(
      chat_id,
      payload,
      decoded_token.id,
    );
  }

  @RemoveCondominiumChatMemberSwagger()
  @Delete('members/:chat_id')
  deleteMembers(
    @UuidParam('chat_id') chat_id: string,
    @Body() body: RemoveCondominiumChatMemberDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumChatService.removeParticipantsFromChat(
      chat_id,
      body,
      decoded_token.id,
    );
  }

  @Delete(':chat_id')
  delete(
    @UuidParam('chat_id') chat_id: string,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumChatService.deleteCondominiumChat(
      chat_id,
      decoded_token.id,
    );
  }
}
