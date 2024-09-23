import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import type { LoadAllResponse } from 'src/modules/schedule-cron-job/dtos/load-all.dto';

import { Schedule } from '../entities/schedule.entity';
import { ScheduleService } from '../services/schedule.service';

export const SCHEDULE_PROCESSOR = 'schedule-queue';
export const SCHEDULE_PROCESS_KEY = 'setup-cron-job';

@Processor(SCHEDULE_PROCESSOR)
export class ScheduleProcessor {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Process(SCHEDULE_PROCESS_KEY)
  async handleSetupCronJob(job: Job<LoadAllResponse>) {
    if (!job.data) return job.discard();

    const { schedule, cron_expression_start, cron_expression_end } = job.data;

    await this.scheduleService.setupCronJobs(
      schedule as Schedule,
      cron_expression_start,
      cron_expression_end,
      true,
    );
  }
}
