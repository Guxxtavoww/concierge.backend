import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import {
  Schedule,
  scheduleAlias,
} from 'src/modules/schedule/entities/schedule.entity';
import { BaseWithIncrementalId } from 'src/lib/database/entities/base.entity';

@Entity('schedule-cron-jobs')
export class ScheduleCronJob extends BaseWithIncrementalId {
  @Index()
  @Column('varchar')
  cron_expression_start: string;

  @Index()
  @Column('varchar')
  cron_expression_end: string;

  @Index({ unique: true })
  @Column('uuid', { unique: true })
  schedule_id: string;

  @ManyToOne(() => Schedule, (schedule) => schedule.cron_jobs)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;
}

export const scheduleCronJobAlias = 'cron-job';
export type ScheduleCronJobSelectKey =
  | `${typeof scheduleCronJobAlias}.${keyof ScheduleCronJob}`
  | `${typeof scheduleAlias}.${keyof Schedule}`;

export const base_fields = [
  'cron-job.cron_expression_end',
  'cron-job.cron_expression_start',
  'schedule.id',
  'schedule.scheduled_datetime_start',
  'schedule.scheduled_datetime_end',
] satisfies ScheduleCronJobSelectKey[];
