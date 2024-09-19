import {
  Injectable,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

import {
  applyOrderByFilters,
  applyQueryFilters,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { Condominium } from 'src/modules/condominium/entities/condominium.entity';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { BadRequestError } from 'src/lib/http-exceptions/errors/types/bad-request-error';
import { CondominiumService } from 'src/modules/condominium/services/condominium.service';

import {
  condominiumAlias,
  membership_base_fields,
  MembershipInvitation,
  membershipInvitationAlias,
} from '../entities/membership-invitation.entity';
import { CondominiumMemberService } from './condominium-member.service';
import { MembershipInvitationStatus } from '../enums/membership-invitation-status.enum';
import { membershipInvitationRepository } from '../repositories/membership-invitation.repository';
import type { PaginateMembershipInvitationsType } from '../dtos/membership-invitation/paginate-membership-invitations.dto';
import type { SendMembershipInvitationType } from '../dtos/membership-invitation/send-membership-invitation.dto';
import type { BulkMembershipInvitationsType } from '../dtos/membership-invitation/bulk-membership-invitations.dto';

@Injectable()
export class MembershipInvitationService {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly condominiumService: CondominiumService,
    private readonly condominiumMemberService: CondominiumMemberService,
  ) {}

  private createMembershipInvitationQueryBuilder() {
    return membershipInvitationRepository
      .createQueryBuilder(membershipInvitationAlias)
      .leftJoinAndSelect(
        `${membershipInvitationAlias}.${condominiumAlias}`,
        condominiumAlias,
      )
      .select(membership_base_fields);
  }

  async paginateMembershipInvitations({
    limit,
    page,
    condominium_id,
    membership_invitation_status,
    user_id,
    ...rest
  }: PaginateMembershipInvitationsType) {
    const queryBuilder = this.createMembershipInvitationQueryBuilder();

    applyQueryFilters(
      membershipInvitationAlias,
      queryBuilder,
      { user_id, membership_invitation_status },
      {
        membership_invitation_status: '=',
        user_id: '=',
      },
    );

    applyQueryFilters(
      condominiumAlias,
      queryBuilder,
      { id: condominium_id },
      { id: '=' },
    );

    applyOrderByFilters(membershipInvitationAlias, queryBuilder, rest);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      page,
      limit,
    });
  }

  async getMembershipInvitationById(id: string) {
    const invitation = await this.createMembershipInvitationQueryBuilder()
      .where(`${membershipInvitationAlias}.id = :id`, { id })
      .getOne();

    if (!invitation) throw new NotFoundError('Invalid Invitation id');

    return invitation;
  }

  async getMembershipInvitationByUserId(user_id: string) {
    const invitation = await this.createMembershipInvitationQueryBuilder()
      .where(`${membershipInvitationAlias}.user_id = :user_id`, { user_id })
      .getOne();

    if (!invitation) throw new NotFoundError('Invalid Invitation id');

    return invitation;
  }

  private async validateMembership(
    condominium: Condominium,
    user_id: string,
    logged_in_user_id: string,
    skipValidations?: boolean,
  ) {
    if (!skipValidations) {
      // Check if the logged-in user is the manager
      if (condominium.manager_id !== logged_in_user_id) {
        throw new ForbiddenException('Only the manager can send invitations');
      }

      // Check if the user is already a member
      const member =
        await this.condominiumMemberService.getMembershipByUserIdAndCondominiumId(
          user_id,
          condominium.id,
        );

      if (member) {
        throw new ForbiddenException('Already a member of this condominium');
      }
    }
  }

  async sendMembershipInvitation(
    condominium_id: string,
    { user_id, is_tenant }: SendMembershipInvitationType,
    logged_in_user_id: string,
    condominium_arg?: Condominium,
    skipValidations?: boolean,
  ): Promise<MembershipInvitation> {
    const condominium =
      condominium_arg ||
      (await this.condominiumService.getCondominiumById(condominium_id));

    await this.validateMembership(
      condominium,
      user_id,
      logged_in_user_id,
      skipValidations,
    );

    const inviteToCreate = MembershipInvitation.create({
      user_id,
      condominium_id: condominium.id,
      is_tenant,
    });

    return membershipInvitationRepository.save(inviteToCreate);
  }

  async bulkMembershipInvitations(
    condominium_id: string,
    payload: BulkMembershipInvitationsType,
    logged_in_user_id: string,
  ): Promise<MembershipInvitation[]> {
    const condominium =
      await this.condominiumService.getCondominiumById(condominium_id);

    if (condominium.manager_id !== logged_in_user_id)
      throw new ForbiddenException('Only the manager can send invitations');

    if (
      payload.length + condominium.total_member_count >
      condominium.max_tenants_amount
    ) {
      throw new BadRequestError('Exceeds maximum number of members');
    }

    const userIdsSet = new Set(payload.map((invite) => invite.user_id));
    const userIds = [...userIdsSet];

    const memberships =
      await this.condominiumMemberService.getMembershipsByUserIdsAndCondominiumId(
        condominium.id,
        userIds,
      );

    const existingMemberIdsSet = new Set(
      memberships.map((membership) => membership.user_id),
    );

    const conflictingIds: string[] = [];

    for (const id of userIds) {
      if (existingMemberIdsSet.has(id)) conflictingIds.push(id);
    }

    if (conflictingIds.length > 0) {
      throw new BadRequestException({
        message: 'Some users are already members of this condominium',
        conflictingUserIds: conflictingIds,
      });
    }

    try {
      const invitesToCreate = payload.map((invite) =>
        MembershipInvitation.create({
          user_id: invite.user_id,
          condominium_id: condominium.id,
          is_tenant: invite.is_tenant,
        }),
      );

      return membershipInvitationRepository.save(invitesToCreate);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async updateInvitationStatus(
    invitation_id: string,
    status: MembershipInvitationStatus,
  ) {
    return membershipInvitationRepository.update(invitation_id, {
      membership_invitation_status: status,
    });
  }

  async handleInvitation(
    id: string,
    logged_in_user_id: string,
    action: 'accept' | 'decline',
  ) {
    const {
      id: membershipInvitationId,
      user_id,
      is_tenant,
      condominium,
    } = await this.getMembershipInvitationById(id);

    if (user_id !== logged_in_user_id)
      throw new ForbiddenException('You are not the one');

    if (action === 'accept') {
      return Promise.all([
        this.updateInvitationStatus(
          membershipInvitationId,
          MembershipInvitationStatus.ACCEPTED,
        ),
        this.condominiumMemberService.createCondominiumMember(condominium.id, {
          is_tenant,
          user_id,
        }),
      ]);
    }

    return this.updateInvitationStatus(
      membershipInvitationId,
      MembershipInvitationStatus.DECLINED,
    );
  }
}
