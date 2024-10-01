import { Injectable } from '@nestjs/common';

import { scheduleAlias } from 'src/modules/schedule/entities/schedule.entity';

import {
  ScheduleCronJob,
  base_fields,
  scheduleCronJobAlias,
} from '../entities/schedule-cron-job.entity';
import type { LoadAllResponse } from '../dtos/load-all.dto';
import type { CreateCronJobDTO } from '../dtos/create-cron-job.dto';
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
    payload: CreateCronJobDTO | CreateCronJobDTO[],
  ): Promise<ScheduleCronJob | ScheduleCronJob[]> {
    const isPayloadArray = Array.isArray(payload);

    if (isPayloadArray) {
      const items = payload.map((cronJob) =>
        scheduleCronJobRepository.create(cronJob),
      );

      return scheduleCronJobRepository.save(items);
    }

    return scheduleCronJobRepository.save(payload);
  }

  async deleteCronJobByScheduleId(schedule_id: string) {
    try {
      return scheduleCronJobRepository.delete({ schedule_id });
    } catch (err) {
      return;
    }
  }
}
