import { Injectable } from '@nestjs/common';

import { scheduleAlias } from 'src/modules/schedule/entities/schedule.entity';

import {
  ScheduleCronJob,
  base_fields,
  scheduleCronJobAlias,
} from '../entities/schedule-cron-job.entity';
import type { LoadAllResponse } from '../dtos/load-all.dto';
import { scheduleCronJobRepository } from '../repositories/schedule-cron-job.repository';

@Injectable()
export class ScheduleCronJobService {
  private createScheduleCronJobQueryBuilder() {
    return scheduleCronJobRepository
      .createQueryBuilder(scheduleCronJobAlias)
      .leftJoinAndSelect(
        `${scheduleCronJobAlias}.${scheduleAlias}`,
        scheduleAlias,
      )
      .select(base_fields);
  }

  async loadAllCronJobs(): Promise<LoadAllResponse[]> {
    return this.createScheduleCronJobQueryBuilder().getMany();
  }

  async saveCronJob(
    schedule_id: string,
    cron_expression_start: string,
    cron_expression_end: string,
  ): Promise<ScheduleCronJob> {
    const item = scheduleCronJobRepository.create({
      cron_expression_end,
      cron_expression_start,
      schedule_id,
    });

    return scheduleCronJobRepository.save(item);
  }

  async deleteCronJobByScheduleId(schedule_id: string) {
    try {
      return scheduleCronJobRepository.delete({ schedule_id });
    } catch (err) {
      return;
    }
  }
}
