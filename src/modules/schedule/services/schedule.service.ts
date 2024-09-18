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
import { BadRequestError } from 'src/lib/http-exceptions/errors/types/bad-request-error';
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
    private readonly condominiumMemberService: CondominiumMemberService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  private createScheduleQueryBuilder() {
    const queryBuilder = scheduleRepository
      .createQueryBuilder(scheduleAlias)
      .leftJoinAndSelect(`${scheduleAlias}.${createdByAlias}`, createdByAlias)
      .select(schedule_base_fields);

    return queryBuilder;
  }

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

  private generateCronExpression(datetime: string): string {
    const { dayOfMonth, dayOfWeek, hours, minutes, month, seconds } =
      this.parseScheduledDatetime(datetime);

    return `${seconds} ${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
  }

  private setupCronJobs(schedule: Schedule) {
    const startCronJob = new CronJob(
      this.generateCronExpression(schedule.scheduled_datetime_start),
      async () => {
        try {
          await scheduleRepository.update(schedule.id, {
            schedule_status: ScheduleStatus.ONGOING,
          });

          this.logService.logger?.log(
            `Schedule ${schedule.id} is now ongoing.`,
          );
        } catch (error) {
          this.logService.logger?.error(
            `Failed to update schedule to Ongoing: ${error.message}`,
          );
        }
      },
    );

    this.schedulerRegistry.addCronJob(
      `schedule-start-${schedule.id}`,
      startCronJob,
    );
    startCronJob.start();

    const endCronJob = new CronJob(
      this.generateCronExpression(schedule.scheduled_datetime_end),
      async () => {
        try {
          await scheduleRepository.update(schedule.id, {
            schedule_status: ScheduleStatus.FINISHED,
          });

          this.logService.logger?.log(
            `Schedule ${schedule.id} is now finished.`,
          );

          this.removeCronJobs(schedule.id);
        } catch (error) {
          this.logService.logger?.error(
            `Failed to update schedule to Finished: ${error.message}`,
          );
        }
      },
    );

    this.schedulerRegistry.addCronJob(
      `schedule-end-${schedule.id}`,
      endCronJob,
    );
    endCronJob.start();
  }

  private removeCronJobs(scheduleId: string) {
    const startJobKey = `schedule-start-${scheduleId}`;

    if (this.schedulerRegistry.doesExist('cron', startJobKey)) {
      this.schedulerRegistry.deleteCronJob(startJobKey);
      this.logService.logger?.log(`Removed cron job: ${startJobKey}`);
    }

    const endJobKey = `schedule-end-${scheduleId}`;

    if (this.schedulerRegistry.doesExist('cron', endJobKey)) {
      this.schedulerRegistry.deleteCronJob(endJobKey);
      this.logService.logger?.log(`Removed cron job: ${endJobKey}`);
    }
  }

  /**
   * returns the id of the condominium
   */
  private async verifyMembership(
    userId: string,
    condominium_id: string,
  ): Promise<string> {
    const membership =
      await this.condominiumMemberService.getMembershipByUserIdAndCondominiumId(
        userId,
        condominium_id,
      );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this condominium');
    }

    return membership.condominium_id;
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
    scheduled_datetime_start,
    scheduled_datetime_end,
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
        scheduled_datetime_start,
        scheduled_datetime_end,
      },
      {
        condominium_id: '=',
        is_private: '=',
        schedule_description: 'LIKE',
        schedule_status: '=',
        schedule_title: 'LIKE',
        schedule_type: '=',
        scheduled_datetime_start: '<=',
        scheduled_datetime_end: '>=',
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

  async getScheduleByDatetimes(
    condominium_id: string,
    payload: Pick<
      CreateSchedulePayload,
      'scheduled_datetime_end' | 'scheduled_datetime_start'
    >,
  ) {
    const scheduleQueryBuilder = this.createScheduleQueryBuilder();

    applyQueryFilters(
      scheduleAlias,
      scheduleQueryBuilder,
      { ...payload, condominium_id },
      {
        scheduled_datetime_end: '>=',
        scheduled_datetime_start: '<=',
        condominium_id: '=',
      },
    );

    return scheduleQueryBuilder.getOne();
  }

  async createSchedule(
    { condominium_id, ...rest }: CreateSchedulePayload,
    logged_in_user_id: string,
  ) {
    const [validatedId, schedule] = await Promise.all([
      this.verifyMembership(logged_in_user_id, condominium_id),
      this.getScheduleByDatetimes(condominium_id, {
        scheduled_datetime_end: rest.scheduled_datetime_end,
        scheduled_datetime_start: rest.scheduled_datetime_start,
      }),
    ]);

    if (schedule) {
      throw new ForbiddenException(
        'A schedule already exists for the selected time range.',
      );
    }

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

    const scheduled_datetime_start =
      payload.scheduled_datetime_start ||
      scheduleToUpdate.scheduled_datetime_start;

    const scheduled_datetime_end =
      payload.scheduled_datetime_end || scheduleToUpdate.scheduled_datetime_end;

    if (
      new Date(scheduled_datetime_start) >= new Date(scheduled_datetime_end)
    ) {
      throw new BadRequestError('Start date must be before the end date');
    }

    const schedule = await this.getScheduleByDatetimes(
      payload.condominium_id || scheduleToUpdate.condominium_id,
      { scheduled_datetime_end, scheduled_datetime_start },
    );

    if (schedule) {
      throw new ForbiddenException(
        'A schedule already exists for the selected time range.',
      );
    }

    const updatedSchedule = await scheduleRepository.update(
      scheduleToUpdate.id,
      Schedule.update(payload),
    );

    if (payload.scheduled_datetime_start || payload.scheduled_datetime_end) {
      this.removeCronJobs(scheduleToUpdate.id);

      const mergedSchedule: Schedule = { ...scheduleToUpdate, ...payload };

      this.setupCronJobs(mergedSchedule);
    }

    return updatedSchedule;
  }

  async updateScheduleConfirmedParticipantsAmount(
    schedule: Schedule,
    type: CountHandler,
  ) {
    if (schedule.confirmed_participants_amount === 0 && type === 'decrement')
      return;

    schedule.confirmed_participants_amount += type === 'increment' ? 1 : -1;

    return scheduleRepository.update(schedule.id, {
      confirmed_participants_amount: schedule.confirmed_participants_amount,
    });
  }

  async addParticipantToSchedule(scheduleId: string, memberId: string) {
    const member =
      await this.condominiumMemberService.getCondominiumMemberById(memberId);

    return scheduleRepository
      .createQueryBuilder()
      .relation('participants')
      .of(scheduleId)
      .add(member.id);
  }

  async deleteSchedule(id: string, logged_in_user_id: string) {
    const scheduleToDelete = await this.getScheduleById(id);

    this.checkPermission(logged_in_user_id, scheduleToDelete);
    this.removeCronJobs(scheduleToDelete.id);

    return scheduleRepository.remove(scheduleToDelete);
  }
}
