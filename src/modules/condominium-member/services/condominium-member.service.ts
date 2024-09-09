import { ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';

import {
  applyOrderByFilters,
  applyQueryFilters,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { CondominiumService } from 'src/modules/condominium/services/condominium.service';

import {
  alias,
  base_fields,
  CondominiumMember,
  perfomatic_fields,
} from '../entities/condominium-member.entity';
import { CreateCondominiumMemberPayload } from '../dtos/create-condominium-member.dto';
import { condominiumMemberRepository } from '../repositories/condominium-member.repository';
import { PaginateCondominiumsMembersPayload } from '../dtos/paginate-condominiums-members.dto';

@Injectable()
export class CondominiumMemberService {
  constructor(
    private readonly paginationService: PaginationService,
    @Inject(forwardRef(() => CondominiumService))
    private readonly condominiumService: CondominiumService,
  ) {}

  private createCondominiumMemberQueryBuilder() {
    return condominiumMemberRepository
      .createQueryBuilder(alias)
      .select(base_fields);
  }

  public createPerfomaticCondominiumMemberQueryBuilder() {
    return condominiumMemberRepository
      .createQueryBuilder(alias)
      .select(perfomatic_fields);
  }

  async paginateMemberships({
    limit,
    page,
    order_by_created_at,
    order_by_updated_at,
    ...filters
  }: PaginateCondominiumsMembersPayload) {
    const queryBuilder = this.createCondominiumMemberQueryBuilder();

    applyQueryFilters(alias, queryBuilder, filters, {
      condominium_id: '=',
      is_tenant: '=',
      user_id: '=',
    });

    applyOrderByFilters(alias, queryBuilder, {
      order_by_created_at,
      order_by_updated_at,
    });

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      limit,
      page,
    });
  }

  async getMembershipById(id: string) {
    const membership = await this.createCondominiumMemberQueryBuilder()
      .where(`${alias}.id = :id`, { id })
      .getOne();

    if (!membership) throw new NotFoundError('Member not found!');

    return membership;
  }

  async getMembershipByUserIdAndCondominiumId(
    user_id: string,
    condominium_id: string,
  ): Promise<NullableValue<CondominiumMember>> {
    const membership = await this.createCondominiumMemberQueryBuilder()
      .where(`${alias}.user_id = :user_id`, { user_id })
      .andWhere(`${alias}.condominium_id = :condominium_id`, {
        condominium_id,
      })
      .getOne();

    return membership;
  }

  async createCondominiumMember(
    { condominium_id, is_tenant }: CreateCondominiumMemberPayload,
    user_id: string,
  ): Promise<CondominiumMember> {
    const isMember = !!(await this.getMembershipByUserIdAndCondominiumId(
      user_id,
      condominium_id,
    ));

    if (isMember)
      throw new ForbiddenException('Already are a member of this condominium');

    const { id } =
      await this.condominiumService.getCondominiumById(condominium_id);

    const condominiumMemberToCreate = CondominiumMember.create({
      condominium_id: id,
      user_id,
      is_tenant,
    });

    return condominiumMemberRepository.save(condominiumMemberToCreate);
  }

  async deleteMembership(id: string, logged_in_user_id: string) {
    const { user_id, id: membershipToDeleteId } =
      await this.getMembershipById(id);

    if (user_id !== logged_in_user_id) {
      throw new ForbiddenException('Not Allowed');
    }

    return condominiumMemberRepository.delete(membershipToDeleteId);
  }
}
