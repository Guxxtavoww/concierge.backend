import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

import { schedule_types } from '../enums/schedule-type.enum';
import { ScheduleService } from '../services/schedule.service';
import { schedule_status } from '../enums/schedule-status.enum';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('schedule-statuses')
  getScheduleStatuses() {
    return schedule_status;
  }

  @Get('schedule-types')
  getScheduleTypes() {
    return schedule_types;
  }
}
