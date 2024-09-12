import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { ScheduleInvite } from '../entities/schedule-invite.entity';

export const scheduleInviteRepository: Repository<ScheduleInvite> =
  AppDataSource.getRepository(ScheduleInvite);
