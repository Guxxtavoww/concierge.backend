import { ForbiddenException, Injectable } from '@nestjs/common';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { BadRequestError } from 'src/lib/http-exceptions/errors/types/bad-request-error';
import { CondominiumService } from 'src/modules/condominium/services/condominium.service';
import { CondominiumMemberService } from 'src/modules/condominium-member/services/condominium-member.service';

import {
  ScheduleInvite,
  scheduleInviteAlias,
  schedule_invite_base_fields,
  scheduleAlias,
} from '../entities/schedule-invite.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleStatus } from '../enums/schedule-status.enum';
import { ScheduleInviteStatus } from '../enums/schedule-invite-status.enum';
import type { SendScheduleInvitePayload } from '../dtos/send-schedule-invite.dto';
import { scheduleInviteRepository } from '../repositories/schedule-invite.repository';
import type { PaginateSchedulesInvitesType } from '../dtos/paginate-schedules-invites.dto';

@Injectable()
export class ScheduleInviteService {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly paginationService: PaginationService,
    private readonly condominiumService: CondominiumService,
    private readonly condominiumMemberService: CondominiumMemberService,
  ) {}

  private createScheduleInviteQueryBuilder() {
    return scheduleInviteRepository
      .createQueryBuilder(scheduleInviteAlias)
      .leftJoinAndSelect(
        `${scheduleInviteAlias}.${scheduleAlias}`,
        scheduleAlias,
      )
      .select(schedule_invite_base_fields);
  }

  async paginateSchedulesInvites({
    limit,
    page,
    order_by_created_at,
    order_by_updated_at,
    schedule_id,
    ...filters
  }: PaginateSchedulesInvitesType) {
    const queryBuilder = this.createScheduleInviteQueryBuilder();

    applyQueryFilters(scheduleInviteAlias, queryBuilder, filters, {
      condominium_member_id: '=',
      schedule_invite_status: '=',
    });

    applyQueryFilters(
      scheduleAlias,
      queryBuilder,
      { id: schedule_id },
      { id: '=' },
    );

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

  async getPendingScheduleInviteByAllFields(
    schedule_id: string,
    condominium_member_id: string,
    condominium_id: string,
  ) {
    const queryBuilder = this.createScheduleInviteQueryBuilder();

    applyQueryFilters(
      scheduleInviteAlias,
      queryBuilder,
      {
        condominium_member_id,
        condominium_id,
        schedule_invite_status: ScheduleInviteStatus.PENDING,
      },
      {
        condominium_id: '=',
        condominium_member_id: '=',
        schedule_invite_status: '=',
      },
    );
    applyQueryFilters(
      scheduleAlias,
      queryBuilder,
      { id: schedule_id },
      { id: '=' },
    );

    return queryBuilder.getOne();
  }

  async updateScheduleInviteStatus(id: string, status: ScheduleInviteStatus) {
    return scheduleInviteRepository.update(id, {
      schedule_invite_status: status,
    });
  }

  async sendScheduleInvite(
    {
      schedule_id,
      condominium_id,
      condominium_member_id,
    }: SendScheduleInvitePayload,
    logged_in_user_id: string,
  ): Promise<ScheduleInvite> {
    const [schedule, condominium, condominium_member] = await Promise.all([
      this.scheduleService.getScheduleById(schedule_id),
      this.condominiumService.getCondominiumById(condominium_id),
      this.condominiumMemberService.getCondominiumMemberById(
        condominium_member_id,
      ),
    ]);

    const scheduleInvite = await this.getPendingScheduleInviteByAllFields(
      schedule.id,
      condominium_member.id,
      condominium.id,
    );

    if (scheduleInvite) throw new BadRequestError('Already invited');

    if (
      schedule.participant_limit &&
      schedule.participant_limit <= schedule.confirmed_participants_amount
    ) {
      throw new ForbiddenException('The schedule is full');
    }

    if (schedule.schedule_status === ScheduleStatus.FINISHED)
      throw new ForbiddenException('The schedule has already ended');

    if (condominium_member.user_id === logged_in_user_id)
      throw new NotFoundError('Cannot invite yourself');

    if (
      schedule.is_private &&
      condominium_member.condominium_id !== condominium.id
    ) {
      throw new ForbiddenException(
        'The member is not part of the same condominium',
      );
    }

    const scheduleInviteToCreate = ScheduleInvite.create({
      condominium_id: condominium.id,
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

    const isAcceptAction = action === 'accept';

    const res = await this.updateScheduleInviteStatus(
      invitation.id,
      isAcceptAction
        ? ScheduleInviteStatus.ACCEPTED
        : ScheduleInviteStatus.DECLINED,
    );

    if (isAcceptAction) {
      await Promise.all([
        this.scheduleService.updateScheduleConfirmedParticipantsAmount(
          invitation.schedule,
          'increment',
        ),
        this.scheduleService.addParticipantToSchedule(
          invitation.schedule.id,
          membership.id,
        ),
      ]);
    }

    return res;
  }
}
