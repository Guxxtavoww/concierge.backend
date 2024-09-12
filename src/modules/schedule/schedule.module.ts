import { Module } from '@nestjs/common';

import { ScheduleService } from './services/schedule.service';
import { CondominiumModule } from '../condominium/condominium.module';
import { ScheduleController } from './controllers/schedule.controller';
import { ScheduleInviteService } from './services/schedule-invite.service';
import { ScheduleInviteController } from './controllers/schedule-invite.controller';
import { CondominiumMemberModule } from '../condominium-member/condominium-member.module';

const providers = [ScheduleService, ScheduleInviteService];

@Module({
  imports: [CondominiumModule, CondominiumMemberModule],
  controllers: [ScheduleController, ScheduleInviteController],
  providers,
  exports: providers,
})
export class ScheduleModule {}
