import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { Condominium } from '../entities/condominium.entity';

export const condominiumRepository: Repository<Condominium> =
  AppDataSource.getRepository(Condominium);
