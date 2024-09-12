import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UuidParam } from 'src/shared/decorators/uuid-param.decorator';
import { DecodedToken } from 'src/shared/decorators/decoded-token.decorator';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination-query.decorator';

import { schedule_types } from '../enums/schedule-type.enum';
import { ScheduleService } from '../services/schedule.service';
import { schedule_status } from '../enums/schedule-status.enum';
import { CreateScheduleDTO } from '../dtos/create-schedule.dto';
import { UpdateScheduleDTO } from '../dtos/update-schedule.dto';
import { PaginateSchedulesDTO } from '../dtos/paginate-schedules.dto';

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

  @ApiPaginationQuery()
  @Get('paginate')
  paginate(@Query() querys: PaginateSchedulesDTO) {
    return this.scheduleService.paginateSchedules(querys);
  }

  @Get(':id')
  getOne(@UuidParam('id') id: string) {
    return this.scheduleService.getScheduleById(id);
  }

  @Post('')
  create(
    @Body() body: CreateScheduleDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.scheduleService.createSchedule(body, decoded_token.id);
  }

  @Put(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateScheduleDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.scheduleService.updateSchedule(id, body, decoded_token.id);
  }

  @Delete(':id')
  delete(
    @UuidParam('id') id: string,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.scheduleService.deleteSchedule(id, decoded_token.id);
  }
}
