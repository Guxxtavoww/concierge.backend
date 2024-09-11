import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { Schedule } from '../entities/schedule.entity';

export const scheduleRepository: Repository<Schedule> =
  AppDataSource.getRepository(Schedule);
