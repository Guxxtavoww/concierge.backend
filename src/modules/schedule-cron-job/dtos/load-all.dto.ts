import { Schedule } from 'src/modules/schedule/entities/schedule.entity';

export interface LoadAllResponse {
  cron_expression_start: string;
  cron_expression_end: string;
  schedule: Pick<
    Schedule,
    'id' | 'scheduled_datetime_end' | 'scheduled_datetime_start'
  >;
}
