import { Column, Entity, Index, JoinColumn, OneToMany } from 'typeorm';

import { BaseWithIncrementalId } from 'src/lib/database/entities/base.entity';
import { Schedule } from 'src/modules/schedule/entities/schedule.entity';

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

  @OneToMany(() => Schedule, (schedule) => schedule.cron_jobs)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;
}
