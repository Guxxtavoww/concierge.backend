import { Injectable } from '@nestjs/common';

import type { LoadAllResponse } from '../dtos/load-all.dto';
import { ScheduleCronJob } from '../entities/schedule-cron-job.entity';
import { scheduleCronJobRepository } from '../repositories/schedule-cron-job.repository';

@Injectable()
export class ScheduleCronJobService {
  async loadAllCronJobs(): Promise<LoadAllResponse[]> {
    return scheduleCronJobRepository.find({
      select: {
        schedule: {
          id: true,
          scheduled_datetime_end: true,
          scheduled_datetime_start: true,
        },
        cron_expression_end: true,
        cron_expression_start: true,
      },
      relations: ['schedule'],
    });
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
