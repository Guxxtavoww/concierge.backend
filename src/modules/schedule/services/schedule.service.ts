import { ForbiddenException, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from 'src/utils/apply-query-filters.utils';
import { LogService } from 'src/lib/log/log.service';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { CondominiumService } from 'src/modules/condominium/services/condominium.service';
import { CondominiumMemberService } from 'src/modules/condominium-member/services/condominium-member.service';

import {
  Schedule,
  scheduleAlias,
  createdByAlias,
  schedule_base_fields,
} from '../entities/schedule.entity';
import { ScheduleStatus } from '../enums/schedule-status.enum';
import { scheduleRepository } from '../repositories/schedule.repository';
import type { CreateSchedulePayload } from '../dtos/create-schedule.dto';
import type { UpdateSchedulePayload } from '../dtos/update-schedule.dto';
import type { PaginateSchedulesType } from '../dtos/paginate-schedules.dto';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly logService: LogService,
    private readonly paginationService: PaginationService,
    private readonly condominiumService: CondominiumService,
    private readonly condominiumMemberService: CondominiumMemberService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  private parseScheduledDatetime(scheduled_datetime: string) {
    const scheduledDate = new Date(scheduled_datetime);
    const seconds = scheduledDate.getSeconds();
    const minutes = scheduledDate.getMinutes();
    const hours = scheduledDate.getHours();
    const dayOfMonth = scheduledDate.getDate();
    const month = scheduledDate.getMonth() + 1; // Months in JS are zero-based
    const dayOfWeek = scheduledDate.getDay();

    return { seconds, minutes, hours, dayOfMonth, month, dayOfWeek };
  }

  private setupCronJobs(savedSchedule: Schedule) {
    const { dayOfMonth, dayOfWeek, hours, minutes, month, seconds } =
      this.parseScheduledDatetime(savedSchedule.scheduled_datetime_start);

    // Set up start cron job
    const startCronExpression = `${seconds} ${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;

    const startCronJob = new CronJob(startCronExpression, async () => {
      try {
        await scheduleRepository.update(savedSchedule.id, {
          schedule_status: ScheduleStatus.ONGOING,
        });
        this.logService.logger?.log(
          `Schedule ${savedSchedule.id} is now ongoing.`,
        );
      } catch (error) {
        this.logService.logger?.error(
          `Failed to update schedule to Ongoing: ${error.message}`,
        );
      }
    });

    this.schedulerRegistry.addCronJob(
      `schedule-start-${savedSchedule.id}`,
      startCronJob,
    );
    startCronJob.start();

    // Set up end cron job
    const {
      dayOfMonth: endDayOfMonth,
      dayOfWeek: endDayOfWeek,
      hours: endHours,
      minutes: endMinutes,
      month: endMonth,
      seconds: endSeconds,
    } = this.parseScheduledDatetime(savedSchedule.scheduled_datetime_end);

    const endCronExpression = `${endSeconds} ${endMinutes} ${endHours} ${endDayOfMonth} ${endMonth} ${endDayOfWeek}`;

    const endCronJob = new CronJob(endCronExpression, async () => {
      try {
        await scheduleRepository.update(savedSchedule.id, {
          schedule_status: ScheduleStatus.FINISHED,
        });
        this.logService.logger?.log(
          `Schedule ${savedSchedule.id} is now finished.`,
        );
      } catch (error) {
        this.logService.logger?.error(
          `Failed to update schedule to Finished: ${error.message}`,
        );
      }
    });

    this.schedulerRegistry.addCronJob(
      `schedule-end-${savedSchedule.id}`,
      endCronJob,
    );
    endCronJob.start();
  }

  private createScheduleQueryBuilder() {
    const queryBuilder = scheduleRepository
      .createQueryBuilder(scheduleAlias)
      .leftJoinAndSelect(`${scheduleAlias}.${createdByAlias}`, createdByAlias)
      .select(schedule_base_fields);

    return queryBuilder;
  }

  /**
   * returns the id of the condominium
   */
  private async verifyMembership(
    userId: string,
    condominium_id: string,
  ): Promise<string> {
    const { id } =
      await this.condominiumService.getCondominiumById(condominium_id);

    const membership =
      await this.condominiumMemberService.getMembershipByUserIdAndCondominiumId(
        userId,
        id,
      );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this condominium');
    }

    return id;
  }

  async paginateSchedules({
    limit,
    page,
    condominium_id,
    created_by_id,
    is_private,
    schedule_description,
    schedule_status,
    schedule_title,
    schedule_type,
    scheduled_datetime,
    ...orderByFields
  }: PaginateSchedulesType) {
    const queryBuilder = this.createScheduleQueryBuilder();

    applyQueryFilters(
      scheduleAlias,
      queryBuilder,
      {
        schedule_status,
        schedule_title,
        schedule_description,
        schedule_type,
        condominium_id,
        is_private,
        scheduled_datetime,
      },
      {
        condominium_id: '=',
        is_private: '=',
        schedule_description: 'LIKE',
        schedule_status: '=',
        schedule_title: 'LIKE',
        schedule_type: '=',
        scheduled_datetime: '>=',
      },
    );
    applyQueryFilters(
      createdByAlias,
      queryBuilder,
      { id: created_by_id },
      { id: '=' },
    );
    applyOrderByFilters(scheduleAlias, queryBuilder, orderByFields);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      page,
      limit,
    });
  }

  async getScheduleById(id: string) {
    const schedule = await this.createScheduleQueryBuilder()
      .where(`${scheduleAlias}.id = :id`, { id })
      .getOne();

    if (!schedule) throw new NotFoundError('Invalid Schedule Id');

    return schedule;
  }

  async createSchedule(
    { condominium_id, ...rest }: CreateSchedulePayload,
    logged_in_user_id: string,
  ) {
    const validatedId = await this.verifyMembership(
      logged_in_user_id,
      condominium_id,
    );

    const scheduleToCreate = Schedule.create({
      created_by_id: logged_in_user_id,
      condominium_id: validatedId,
      ...rest,
    });

    const savedSchedule = await scheduleRepository.save(scheduleToCreate);

    this.setupCronJobs(savedSchedule);

    return savedSchedule;
  }

  private checkPermission(logged_in_user_id: string, schedule: Schedule) {
    if (logged_in_user_id !== schedule.created_by.id) {
      throw new ForbiddenException('Not Allowed');
    }
  }

  async updateSchedule(
    id: string,
    payload: UpdateSchedulePayload,
    logged_in_user_id: string,
  ) {
    const scheduleToUpdate = await this.getScheduleById(id);

    this.checkPermission(logged_in_user_id, scheduleToUpdate);

    if (payload.condominium_id) {
      await this.verifyMembership(logged_in_user_id, payload.condominium_id);
    }

    const scheduleItem = Schedule.update(payload);

    return scheduleRepository.update(scheduleToUpdate.id, scheduleItem);
  }

  async deleteSchedule(id: string, logged_in_user_id: string) {
    const scheduleToDelete = await this.getScheduleById(id);

    this.checkPermission(logged_in_user_id, scheduleToDelete);

    return scheduleRepository.remove(scheduleToDelete);
  }
}
