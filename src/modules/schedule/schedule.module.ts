import { Module } from '@nestjs/common';

import { ScheduleService } from './services/schedule.service';
import { CondominiumModule } from '../condominium/condominium.module';
import { ScheduleController } from './controllers/schedule.controller';

@Module({
  imports: [CondominiumModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
