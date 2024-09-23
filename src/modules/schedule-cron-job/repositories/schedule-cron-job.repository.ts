import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { ScheduleCronJob } from '../entities/schedule-cron-job.entity';

export const scheduleCronJobRepository: Repository<ScheduleCronJob> =
  AppDataSource.getRepository(ScheduleCronJob);
