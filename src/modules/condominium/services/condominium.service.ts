import { ForbiddenException, Injectable } from '@nestjs/common';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';

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
  constructor(private readonly paginationService: PaginationService) {}

  private createQueryBuilder() {
    return condominiumRepository.createQueryBuilder(alias).select(base_fields);
  }

  private checkPermission(manager_id: string, logged_in_user_id: string) {
    if (manager_id !== logged_in_user_id)
      throw new ForbiddenException('Not Allowed to change this condominuim');
  }

  async paginateCondominiums({
    limit,
    page,
    order_by_created_at,
    order_by_updated_at,
    ...filters
  }: PaginateCondominiumsType) {
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
    });

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      limit,
      page,
    });
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

    return condominiumRepository.save(condominiumToCreate);
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
