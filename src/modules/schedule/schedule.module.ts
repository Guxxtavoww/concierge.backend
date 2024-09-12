import { Module } from '@nestjs/common';

import { ScheduleService } from './services/schedule.service';
import { CondominiumModule } from '../condominium/condominium.module';
import { ScheduleController } from './controllers/schedule.controller';
import { ScheduleInviteService } from './services/schedule-invite.service';
import { ScheduleInviteController } from './controllers/schedule-invite.controller';

@Module({
  imports: [CondominiumModule],
  controllers: [ScheduleController, ScheduleInviteController],
  providers: [ScheduleService, ScheduleInviteService],
})
export class ScheduleModule {}
