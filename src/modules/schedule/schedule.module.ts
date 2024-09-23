import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import {
  SCHEDULE_PROCESSOR,
  ScheduleProcessor,
} from './processors/schedule.processor';
import { ScheduleService } from './services/schedule.service';
import { CondominiumModule } from '../condominium/condominium.module';
import { ScheduleController } from './controllers/schedule.controller';
import { ScheduleInviteService } from './services/schedule-invite.service';
import { ScheduleInviteController } from './controllers/schedule-invite.controller';
import { ScheduleCronJobModule } from '../schedule-cron-job/schedule-cron-job.module';
import { CondominiumMemberModule } from '../condominium-member/condominium-member.module';

const providers = [ScheduleService, ScheduleInviteService];

@Module({
  imports: [
    ScheduleCronJobModule,
    CondominiumMemberModule,
    CondominiumModule,
    BullModule.registerQueue({
      name: SCHEDULE_PROCESSOR,
    }),
  ],
  controllers: [ScheduleController, ScheduleInviteController],
  providers: [...providers, ScheduleProcessor],
  exports: providers,
})
export class ScheduleModule {}
