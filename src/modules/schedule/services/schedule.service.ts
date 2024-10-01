import {
  Injectable,
  ForbiddenException,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { CronJob } from 'cron';
import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { SchedulerRegistry } from '@nestjs/schedule';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from 'src/utils/apply-query-filters.utils';
import { LogService } from 'src/lib/log/log.service';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { BadRequestError } from 'src/lib/http-exceptions/errors/types/bad-request-error';
import { ScheduleCronJobService } from 'src/modules/schedule-cron-job/services/schedule-cron-job.service';
import { condominiumMemberAlias } from 'src/modules/condominium-member/entities/condominium-member.entity';
import { CondominiumMemberService } from 'src/modules/condominium-member/services/condominium-member.service';

import {
  Schedule,
  scheduleAlias,
  createdByAlias,
  schedule_base_fields,
} from '../entities/schedule.entity';
import { ScheduleStatus } from '../enums/schedule-status.enum';
import { SCHEDULE_PROCESS_KEY } from '../processors/schedule.processor';
import { scheduleRepository } from '../repositories/schedule.repository';
import type { CreateSchedulePayload } from '../dtos/create-schedule.dto';
import type { UpdateSchedulePayload } from '../dtos/update-schedule.dto';
import type { PaginateSchedulesType } from '../dtos/paginate-schedules.dto';
import type { PaginateScheduleParticipantsType } from '../dtos/paginate-schedule-participants.dto';

@Injectable()
export class ScheduleService implements OnApplicationBootstrap {
  constructor(
    private readonly logService: LogService,
    private readonly paginationService: PaginationService,
    private readonly condominiumMemberService: CondominiumMemberService,
    private readonly scheduleCronJobService: ScheduleCronJobService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectQueue('schedule-queue') private scheduleQueue: Queue,
  ) {}
  SCHEDULE_PROCESSOR
  async onApplicationBootstrap() {
    const scheduleCronJobs =
      await this.scheduleCronJobService.loadAllCronJobs();

    if (!scheduleCronJobs.length) return;

    await Promise.all(
      scheduleCronJobs.map(
        ({ cron_expression_end, cron_expression_start, schedule }) =>
          this.scheduleQueue.add(SCHEDULE_PROCESS_KEY, {
            schedule,
            cron_expression_start,
            cron_expression_end,
          }),
      ),
    );
  }

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

  async setupCronJobs(
    schedule: Schedule,
    cron_expression_start?: Maybe<string>,
    cron_expression_end?: Maybe<string>,
    skipSave?: boolean,
  ) {
    const scheduleId = schedule.id;

    const cronExpressionStart =
      cron_expression_start ||
      this.generateCronExpression(schedule.scheduled_datetime_start);

    const cronExpressionEnd =
      cron_expression_end ||
      this.generateCronExpression(schedule.scheduled_datetime_end);

    const startCronJob = new CronJob(cronExpressionStart, async () => {
      try {
        await scheduleRepository.update(scheduleId, {
          schedule_status: ScheduleStatus.ONGOING,
        });

        this.logService.logger?.log(`Schedule ${scheduleId} is now ongoing.`);
      } catch (error) {
        this.logService.logger?.error(
          `Failed to update schedule to Ongoing: ${error.message}`,
        );
      }
    });

    this.schedulerRegistry.addCronJob(
      `schedule-start-${scheduleId}`,
      startCronJob,
    );
    startCronJob.start();

    const endCronJob = new CronJob(cronExpressionEnd, async () => {
      try {
        await scheduleRepository.update(scheduleId, {
          schedule_status: ScheduleStatus.FINISHED,
        });

        this.logService.logger?.log(`Schedule ${scheduleId} is now finished.`);
        await this.removeCronJobs(scheduleId);
      } catch (error) {
        this.logService.logger?.error(
          `Failed to update schedule to Finished: ${error.message}`,
        );
      }
    });

    this.schedulerRegistry.addCronJob(`schedule-end-${scheduleId}`, endCronJob);
    endCronJob.start();

    if (!skipSave) {
      await this.scheduleCronJobService.saveCronJob(
        scheduleId,
        cronExpressionStart,
        cronExpressionEnd,
      );
    }
  }

  private async removeCronJobs(scheduleId: string) {
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

    await this.scheduleCronJobService.deleteCronJobByScheduleId(scheduleId);
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

  async paginateScheduleParticipants({
    schedule_id,
    limit,
    page,
    ...orderBy
  }: PaginateScheduleParticipantsType) {
    const queryBuilder = this.condominiumMemberService
      .createMemberQueryBuilderWithEvents()
      .where(`schedule.id = :schedule_id`, { schedule_id });

    applyOrderByFilters(condominiumMemberAlias, queryBuilder, orderBy);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      limit,
      page,
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
    const [validatedCondominiumId, schedule] = await Promise.all([
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
      condominium_id: validatedCondominiumId,
      ...rest,
    });

    const savedSchedule = await scheduleRepository.save(scheduleToCreate);

    await this.setupCronJobs(savedSchedule);

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
      await this.removeCronJobs(scheduleToUpdate.id);

      const mergedSchedule: Schedule = { ...scheduleToUpdate, ...payload };

      await this.setupCronJobs(mergedSchedule);
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
    await this.removeCronJobs(scheduleToDelete.id);

    return scheduleRepository.remove(scheduleToDelete);
  }
}
