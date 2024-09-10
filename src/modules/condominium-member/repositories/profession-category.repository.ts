import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { ProfessionCategory } from '../entities/profession-category.entity';

export const professionCategoryRepository: Repository<ProfessionCategory> =
  AppDataSource.getRepository(ProfessionCategory);
