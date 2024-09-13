import { ForbiddenException, Injectable } from '@nestjs/common';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { CondominiumMemberService } from 'src/modules/condominium-member/services/condominium-member.service';

import {
  ScheduleInvite,
  scheduleInviteAlias,
  schedule_invite_base_fields,
} from '../entities/schedule-invite.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleInviteStatus } from '../enums/schedule-invite-status.enum';
import type { SendScheduleInvitePayload } from '../dtos/send-schedule-invite.dto';
import { scheduleInviteRepository } from '../repositories/schedule-invite.repository';
import type { PaginateSchedulesInvitesType } from '../dtos/paginate-schedules-invites.dto';

@Injectable()
export class ScheduleInviteService {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly paginationService: PaginationService,
    private readonly condominiumMemberService: CondominiumMemberService,
  ) {}

  private createScheduleInviteQueryBuilder() {
    return scheduleInviteRepository
      .createQueryBuilder(scheduleInviteAlias)
      .select(schedule_invite_base_fields);
  }

  async paginateSchedulesInvites({
    limit,
    page,
    order_by_created_at,
    order_by_updated_at,
    ...filters
  }: PaginateSchedulesInvitesType) {
    const queryBuilder = this.createScheduleInviteQueryBuilder();

    applyQueryFilters(scheduleInviteAlias, queryBuilder, filters, {
      condominium_member_id: '=',
      schedule_id: '=',
      schedule_invite_status: '=',
    });

    applyOrderByFilters(scheduleInviteAlias, queryBuilder, {
      order_by_created_at,
      order_by_updated_at,
    });

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      page,
      limit,
    });
  }

  async getScheduleInviteById(id: string): Promise<ScheduleInvite> {
    const invitation = await this.createScheduleInviteQueryBuilder()
      .where(`${scheduleInviteAlias}.id = :id`, { id })
      .getOne();

    if (!invitation) throw new NotFoundError('Invalid Id!');

    return invitation;
  }

  async updateScheudleInviteStatus(id: string, status: ScheduleInviteStatus) {
    return scheduleInviteRepository.update(id, {
      schedule_invite_status: status,
    });
  }

  async sendScheduleInvite(
    { condominium_id, schedule_id }: SendScheduleInvitePayload,
    logged_in_user_id: string,
  ): Promise<ScheduleInvite> {
    const [condominium_member, schedule] = await Promise.all([
      this.condominiumMemberService.getMembershipByUserIdAndCondominiumId(
        logged_in_user_id,
        condominium_id,
      ),
      this.scheduleService.getScheduleById(schedule_id),
    ]);

    if (!condominium_member || condominium_member.user_id === logged_in_user_id)
      throw new NotFoundError('Invalid Member');

    const scheduleInviteToCreate = ScheduleInvite.create({
      condominium_id: condominium_member.condominium_id,
      condominium_member_id: condominium_member.id,
      schedule_id: schedule.id,
    });

    return scheduleInviteRepository.save(scheduleInviteToCreate);
  }

  async handleInvitation(
    invitation_id: string,
    logged_in_user_id: string,
    action: 'accept' | 'decline',
  ) {
    const invitation = await this.getScheduleInviteById(invitation_id);
    const membership =
      await this.condominiumMemberService.getMembershipByUserIdAndCondominiumId(
        logged_in_user_id,
        invitation.condominium_id,
      );

    if (!membership) throw new ForbiddenException('Not a member');

    if (membership.user_id !== logged_in_user_id)
      throw new ForbiddenException('Cant accept this invitation.');

    return this.updateScheudleInviteStatus(
      invitation.id,
      action === 'accept'
        ? ScheduleInviteStatus.ACCEPTED
        : ScheduleInviteStatus.DECLINED,
    );
  }
}
