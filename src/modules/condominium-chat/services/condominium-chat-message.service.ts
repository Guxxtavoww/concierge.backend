import { ForbiddenException, Injectable } from '@nestjs/common';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';

import {
  base_fields,
  CondominiumChatMessage,
  condominiumChatMessageAlias,
} from '../entities/condominium-chat-message.entity';
import type { CreateCondominiumChatMessageType } from '../dtos/condominium-chat-message/create.dto';
import type { UpdateCondominiumChatMessageType } from '../dtos/condominium-chat-message/update.dto';
import { condominiumChatMessageRepository } from '../repositories/condominium-chat-message.repository';
import type { PaginateCondominiumChatMessagesType } from '../dtos/condominium-chat-message/paginate.dto';

@Injectable()
export class CondominiumChatMessageService {
  constructor(private readonly paginationService: PaginationService) {}

  private createChatMessageQueryBuilder() {
    return condominiumChatMessageRepository
      .createQueryBuilder(condominiumChatMessageAlias)
      .select(base_fields);
  }

  private checkPermission(message: CondominiumChatMessage, member_id: string) {
    if (message.sended_by_id !== member_id) {
      throw new ForbiddenException('Message was not sent by you');
    }
  }

  private async getMessageAndCheckPermission(
    message_id: string,
    member_id: string,
  ) {
    const message = await this.getMessageById(message_id);
    this.checkPermission(message, member_id);

    return message;
  }

  async paginateChatMessages({
    limit,
    page,
    condominium_chat_id,
    message_text,
    ...orderBy
  }: PaginateCondominiumChatMessagesType) {
    const queryBuilder = this.createChatMessageQueryBuilder();

    applyQueryFilters(
      condominiumChatMessageAlias,
      queryBuilder,
      { condominium_chat_id, message_text },
      {
        condominium_chat_id: '=',
        message_text: 'LIKE',
      },
    );
    applyOrderByFilters(condominiumChatMessageAlias, queryBuilder, orderBy);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      limit,
      page,
    });
  }

  async getMessageById(id: string): Promise<CondominiumChatMessage> {
    const message = await this.createChatMessageQueryBuilder()
      .where(`${condominiumChatMessageAlias}.id = :id`, { id })
      .getOne();

    if (!message) throw new NotFoundError('Ivalid message id');

    return message;
  }

  async sendMessage(
    condominium_chat_id: string,
    payload: CreateCondominiumChatMessageType,
  ) {
    const messageToCreate = CondominiumChatMessage.create({
      ...payload,
      condominium_chat_id,
    });

    return condominiumChatMessageRepository.save(messageToCreate);
  }

  async updateMessage(
    message_id: string,
    member_id: string,
    payload: UpdateCondominiumChatMessageType,
  ) {
    const messageToUpdate = await this.getMessageAndCheckPermission(
      message_id,
      member_id,
    );

    return condominiumChatMessageRepository.update(
      messageToUpdate.id,
      CondominiumChatMessage.update(payload),
    );
  }

  async deleteMessage(message_id: string, member_id: string) {
    const messageToDelete = await this.getMessageAndCheckPermission(
      message_id,
      member_id,
    );

    return condominiumChatMessageRepository.delete(messageToDelete.id);
  }
}
