import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { Profession } from '../entities/profession.entity';

export const professionRepository: Repository<Profession> =
  AppDataSource.getRepository(Profession);
