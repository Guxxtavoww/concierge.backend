import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UuidParam } from 'src/shared/decorators/uuid-param.decorator';
import { DecodedToken } from 'src/shared/decorators/decoded-token.decorator';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination-query.decorator';
import { DataBaseInterceptorDecorator } from 'src/shared/decorators/database-interceptor.decorator';

import { SendScheduleInviteDTO } from '../dtos/send-schedule-invite.dto';
import { ScheduleInviteService } from '../services/schedule-invite.service';
import { schedule_invite_status } from '../enums/schedule-invite-status.enum';
import { PaginateSchedulesInvitesDTO } from '../dtos/paginate-schedules-invites.dto';

@ApiTags('schedule-invite')
@Controller('schedule-invite')
export class ScheduleInviteController {
  constructor(private readonly scheduleInviteService: ScheduleInviteService) {}

  @Get('schedule-invite-statuses')
  getScheduleInviteStatuses() {
    return schedule_invite_status;
  }

  @ApiPaginationQuery()
  @Get('paginate')
  paginate(@Query() querys: PaginateSchedulesInvitesDTO) {
    return this.scheduleInviteService.paginateSchedulesInvites(querys);
  }

  @DataBaseInterceptorDecorator()
  @Post('send-invitation')
  sendInvitation(
    @Body() body: SendScheduleInviteDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.scheduleInviteService.sendScheduleInvite(
      body,
      decoded_token.id,
    );
  }

  @DataBaseInterceptorDecorator()
  @Put('accept-invitation/:invitation_id')
  accept(
    @UuidParam('invitation_id') invitation_id: string,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.scheduleInviteService.handleInvitation(
      invitation_id,
      decoded_token.id,
      'accept',
    );
  }

  @DataBaseInterceptorDecorator()
  @Put('decline-invitation/:invitation_id')
  decline(
    @UuidParam('invitation_id') invitation_id: string,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.scheduleInviteService.handleInvitation(
      invitation_id,
      decoded_token.id,
      'decline',
    );
  }
}
