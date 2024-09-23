import { Module } from '@nestjs/common';

import { ScheduleCronJobService } from './services/schedule-cron-job.service';

@Module({
  providers: [ScheduleCronJobService],
  exports: [ScheduleCronJobService],
})
export class ScheduleCronJobModule {}
