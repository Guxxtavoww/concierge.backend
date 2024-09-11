import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { alias as memberAlias } from 'src/modules/condominium-member/entities/condominium-member.entity';
import { CondominiumMemberService } from 'src/modules/condominium-member/services/condominium-member.service';

import {
  alias,
  base_fields,
  Condominium,
} from '../entities/condominium.entity';
import type { CreateCondominiumType } from '../dtos/create-condominium.dto';
import type { UpdateCondominiumType } from '../dtos/update-condominium.dto';
import { condominiumRepository } from '../repositories/condominium.repository';
import type { PaginateCondominiumsType } from '../dtos/paginate-condominiums.dto';

@Injectable()
export class CondominiumService {
  constructor(
    private readonly paginationService: PaginationService,
    @Inject(forwardRef(() => CondominiumMemberService))
    private readonly condominiumMemberService: CondominiumMemberService,
  ) {}

  private createQueryBuilder() {
    return condominiumRepository.createQueryBuilder(alias).select(base_fields);
  }

  private checkPermission(manager_id: string, logged_in_user_id: string) {
    if (manager_id !== logged_in_user_id)
      throw new ForbiddenException('Not Allowed to change this condominuim');
  }

  private async addIsMemberToCondominiums(
    condominiums: Condominium[],
    logged_in_user_id: string,
  ) {
    if (!condominiums.length) return [];

    const condominiumsIds = new Array(
      ...new Set(condominiums.map((c) => c.id)),
    );

    const memberships = await this.condominiumMemberService
      .createPerfomaticCondominiumMemberQueryBuilder()
      .where(`${memberAlias}.condominium_id IN (:...condominiumsIds)`, {
        condominiumsIds,
      })
      .andWhere(`${memberAlias}.user_id = :logged_in_user_id`, {
        logged_in_user_id,
      })
      .take(condominiumsIds.length)
      .getMany();

    const membershipsIdsSet = new Set(
      memberships.map((membership) => membership.condominium_id),
    );

    return condominiums.map((condominium) => ({
      ...condominium,
      is_current_user_member: membershipsIdsSet.has(condominium.id),
    }));
  }

  async paginateCondominiums(
    {
      limit,
      page,
      order_by_created_at,
      order_by_updated_at,
      order_by_total_member_count,
      ...filters
    }: PaginateCondominiumsType,
    logged_in_user_id: string,
  ) {
    const queryBuilder = this.createQueryBuilder();

    applyQueryFilters(alias, queryBuilder, filters, {
      address: 'LIKE',
      city: '=',
      condominium_name: 'LIKE',
      description: 'LIKE',
      has_grill: '=',
      has_gym: '=',
      has_park: '=',
      has_pool: '=',
      has_security: '=',
      max_tenants_amount: '<=',
      monthly_fee: '<=',
      state: '=',
      total_units: '=',
      year_built: '=',
    });

    applyOrderByFilters(alias, queryBuilder, {
      order_by_created_at,
      order_by_updated_at,
      order_by_total_member_count,
    });

    const { items, meta } =
      await this.paginationService.paginateWithQueryBuilder(queryBuilder, {
        limit,
        page,
      });

    return {
      items: await this.addIsMemberToCondominiums(items, logged_in_user_id),
      meta,
    };
  }

  async getCondominiumById(id: string): Promise<Condominium> {
    const condominium = await this.createQueryBuilder()
      .where(`${alias}.id = :id`, { id })
      .getOne();

    if (!condominium) throw new NotFoundError('Invalid Condominium Id');

    return condominium;
  }

  async createCondominium(
    payload: CreateCondominiumType,
    manager_id: string,
  ): Promise<Condominium> {
    const condominiumToCreate = Condominium.create({ ...payload, manager_id });

    const savedCondominium =
      await condominiumRepository.save(condominiumToCreate);

    await this.condominiumMemberService.createCondominiumMember(
      { condominium_id: savedCondominium.id, is_tenant: true },
      savedCondominium.manager_id,
    );

    return savedCondominium;
  }

  async updateTotalMemberCount(condominium: Condominium, type: CountHandler) {
    if (condominium.total_member_count === 0 && type === 'decrement') return;

    condominium.total_member_count += type === 'increment' ? 1 : -1;

    return condominiumRepository.update(condominium.id, {
      total_member_count: condominium.total_member_count,
    });
  }

  async updateCondominium(
    id: string,
    payload: UpdateCondominiumType,
    logged_in_user_id: string,
  ) {
    const condominiumToUpdate = await this.getCondominiumById(id);

    this.checkPermission(condominiumToUpdate.manager_id, logged_in_user_id);

    const data = Condominium.update(payload);

    return condominiumRepository.update(condominiumToUpdate.id, data);
  }

  async deleteCondominium(id: string, logged_in_user_id: string) {
    const condominium = await this.getCondominiumById(id);

    this.checkPermission(condominium.manager_id, logged_in_user_id);

    return condominiumRepository.delete(condominium.id);
  }
}
