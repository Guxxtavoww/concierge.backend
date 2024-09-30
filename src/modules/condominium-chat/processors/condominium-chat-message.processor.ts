import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { LogService } from 'src/lib/log/log.service';

import type { DeleteChatMessageType } from '../dtos/condominium-chat-message/delete.dto';
import { CondominiumChatMessageService } from '../services/condominium-chat-message.service';
import type { CreateCondominiumChatMessageType } from '../dtos/condominium-chat-message/create.dto';
import type { UpdateCondominiumChatMessageType } from '../dtos/condominium-chat-message/update.dto';

export enum CONDOMINIUM_CHAT_MESSAGE_KEYS {
  SEND = 'send-message',
  UPDATE = 'update-message',
  DELETE = 'delete-message',
}

export const CONDOMINIUM_CHAT_MESSAGE_PROCESSOR =
  'condominium-chat-message-queue';

@Processor(CONDOMINIUM_CHAT_MESSAGE_PROCESSOR)
export class CondominiumChatMessageProcessor {
  constructor(
    private readonly logService: LogService,
    private readonly condominiumChatMessageService: CondominiumChatMessageService,
  ) {}

  @Process(CONDOMINIUM_CHAT_MESSAGE_KEYS.SEND)
  async handleSendMessage(job: Job<CreateCondominiumChatMessageType>) {
    try {
      return await this.condominiumChatMessageService.sendMessage(job.data);
    } catch (error) {
      this.logService.logger?.error('Failed to create message', error);
      throw error;
    }
  }

  @Process(CONDOMINIUM_CHAT_MESSAGE_KEYS.UPDATE)
  async handleUpdateMessage(job: Job<UpdateCondominiumChatMessageType>) {
    try {
      return await this.condominiumChatMessageService.updateMessage(job.data);
    } catch (error) {
      this.logService.logger?.error('Failed to update message', error);
      throw error;
    }
  }

  @Process(CONDOMINIUM_CHAT_MESSAGE_KEYS.DELETE)
  async handleDeleteMessage(job: Job<DeleteChatMessageType>) {
    try {
      return await this.condominiumChatMessageService.deleteMessage(job.data);
    } catch (error) {
      this.logService.logger?.error('Failed to delete message', error);
      throw error;
    }
  }
}
