import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  applyOrderByFilters,
  applyQueryFilters,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { Condominium } from 'src/modules/condominium/entities/condominium.entity';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { CondominiumService } from 'src/modules/condominium/services/condominium.service';
import { BadRequestError } from 'src/lib/http-exceptions/errors/types/bad-request-error';

import {
  alias,
  base_fields,
  CondominiumMember,
  perfomatic_fields,
} from '../entities/condominium-member.entity';
import { CreateCondominiumMemberPayload } from '../dtos/condominium-member/create-condominium-member.dto';
import { condominiumMemberRepository } from '../repositories/condominium-member.repository';
import { PaginateCondominiumsMembersPayload } from '../dtos/condominium-member/paginate-condominiums-members.dto';
import type { BulkCondominiumMemberType } from '../dtos/condominium-member/bulk-condominium-member.dto';

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

  async getMembershipByUserId(user_id: string) {
    const membership = await this.createCondominiumMemberQueryBuilder()
      .where(`${alias}.user_id = :user_id`, { user_id })
      .getOne();

    if (!membership) throw new NotFoundError('Member not found!');

    return membership;
  }

  async getMemberProfessions(
    id: string,
  ): Promise<Pick<CondominiumMember, 'professions' | 'user_id' | 'id'>> {
    const result = await condominiumMemberRepository.findOne({
      where: { id },
      relations: ['professions'],
      select: {
        professions: true,
        user_id: true,
        id: true,
      },
    });

    if (!result) throw new NotFoundError();

    return result;
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
    condominium_id: string,
    { is_tenant, user_id }: CreateCondominiumMemberPayload,
    logged_in_user_id: string,
    condominium_arg?: Condominium,
  ): Promise<CondominiumMember> {
    const condominium =
      condominium_arg ||
      (await this.condominiumService.getCondominiumById(condominium_id));

    if (condominium.manager_id !== logged_in_user_id)
      throw new ForbiddenException('Cant add members');

    const isMember = !!(await this.getMembershipByUserIdAndCondominiumId(
      user_id,
      condominium.id,
    ));

    if (isMember)
      throw new ForbiddenException('Already are a member of this condominium');

    const condominiumMemberToCreate = CondominiumMember.create({
      condominium_id: condominium.id,
      user_id,
      is_tenant,
    });

    const savedMember = await condominiumMemberRepository.save(
      condominiumMemberToCreate,
    );

    await this.condominiumService.updateTotalMemberCount(
      condominium,
      'increment',
    );

    return savedMember;
  }

  async bulkCondominiumMembers(
    condominium_id: string,
    payload: BulkCondominiumMemberType,
    logged_in_user_id: string,
  ) {
    const condominium =
      await this.condominiumService.getCondominiumById(condominium_id);

    if (
      condominium.total_member_count + payload.length >
      condominium.max_tenants_amount
    ) {
      throw new BadRequestError('Exceeds maximum number of members');
    }

    try {
      const results = await Promise.all(
        payload.map((condominiumMember) =>
          this.createCondominiumMember(
            condominium_id,
            condominiumMember,
            logged_in_user_id,
            condominium,
          ),
        ),
      );

      return results;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteMembership(id: string, logged_in_user_id: string) {
    const {
      user_id,
      id: membershipToDeleteId,
      condominium_id,
    } = await this.getMembershipById(id);

    if (user_id !== logged_in_user_id) {
      throw new ForbiddenException('Not Allowed');
    }

    const condominium =
      await this.condominiumService.getCondominiumById(condominium_id);

    await this.condominiumService.updateTotalMemberCount(
      condominium,
      'decrement',
    );

    return condominiumMemberRepository.delete(membershipToDeleteId);
  }
}
