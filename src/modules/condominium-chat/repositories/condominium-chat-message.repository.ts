import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { CondominiumChatMessage } from '../entities/condominium-chat-message.entity';

export const condominiumChatMessageRepository: Repository<CondominiumChatMessage> =
  AppDataSource.getRepository(CondominiumChatMessage);
