import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { CondominiumChat } from '../entities/condominium-chat.entity';

export const condominiumChatRepository: Repository<CondominiumChat> =
  AppDataSource.getRepository(CondominiumChat);
