import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ScheduleInviteService } from '../services/schedule-invite.service';
import { schedule_invite_status } from '../enums/schedule-invite-status.enum';

@ApiTags('schedule-invite')
@Controller('schedule-invite')
export class ScheduleInviteController {
  constructor(private readonly scheduleInviteService: ScheduleInviteService) {}

  @Get('schedule-invite-statuses')
  getScheduleInviteStatuses() {
    return schedule_invite_status;
  }
}
