import { ForbiddenException, Injectable } from '@nestjs/common';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from 'src/utils/apply-query-filters.utils';
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
import { scheduleRepository } from '../repositories/schedule.repository';
import type { CreateSchedulePayload } from '../dtos/create-schedule.dto';
import type { UpdateSchedulePayload } from '../dtos/update-schedule.dto';
import type { PaginateSchedulesType } from '../dtos/paginate-schedules.dto';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly condominiumService: CondominiumService,
    private readonly condominiumMemberService: CondominiumMemberService,
  ) {}

  private createScheduleQueryBuilder() {
    const queryBuilder = scheduleRepository
      .createQueryBuilder(scheduleAlias)
      .leftJoinAndSelect(`${scheduleAlias}.${createdByAlias}`, createdByAlias)
      .select(schedule_base_fields);

    return queryBuilder;
  }

  private async verifyMembership(userId: string, condominium_id: string) {
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

    return scheduleRepository.save(scheduleToCreate);
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
