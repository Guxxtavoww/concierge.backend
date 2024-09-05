import { ForbiddenException, Injectable } from '@nestjs/common';

import { isNullableValue } from 'src/utils/is-nullable-value.util';
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
    address,
    city,
    condominium_name,
    description,
    has_grill,
    has_gym,
    has_park,
    has_pool,
    has_security,
    max_tenants_amount,
    monthly_fee,
    state,
    total_units,
    year_built,
    order_by_created_at,
    order_by_updated_at,
  }: PaginateCondominiumsType) {
    const queryBuilder = this.createQueryBuilder()
      .where(
        condominium_name
          ? `LOWER(${alias}.condominium_name) LIKE :condominium_name`
          : '1=1',
        { condominium_name: `%${condominium_name}%` },
      )
      .andWhere(
        description ? `LOWER(${alias}.description) LIKE :description` : '1=1',
        { description: `%${description}%` },
      )
      .andWhere(address ? `LOWER(${alias}.address) LIKE :address` : '1=1', {
        address: `%${address}%`,
      })
      .andWhere(city ? `${alias}.city = :city` : '1=1', {
        city,
      })
      .andWhere(state ? `${alias}.state = :state` : '1=1', {
        state,
      })
      .andWhere(
        !isNullableValue(monthly_fee)
          ? `${alias}.monthly_fee = :monthly_fee`
          : '1=1',
        { monthly_fee },
      )
      .andWhere(
        !isNullableValue(has_grill) ? `${alias}.has_grill = :has_grill` : '1=1',
        { has_grill },
      )
      .andWhere(
        !isNullableValue(has_gym) ? `${alias}.has_gym = :has_gym` : '1=1',
        {
          has_gym,
        },
      )
      .andWhere(
        !isNullableValue(has_park) ? `${alias}.has_park = :has_park` : '1=1',
        { has_park },
      )
      .andWhere(
        !isNullableValue(has_pool) ? `${alias}.has_pool = :has_pool` : '1=1',
        { has_pool },
      )
      .andWhere(
        !isNullableValue(has_security)
          ? `${alias}.has_security = :has_security`
          : '1=1',
        { has_security },
      )
      .andWhere(
        !isNullableValue(max_tenants_amount)
          ? `${alias}.max_tenants_amount = :max_tenants_amount`
          : '1=1',
        { max_tenants_amount },
      )
      .andWhere(
        !isNullableValue(total_units)
          ? `${alias}.total_units = :total_units`
          : '1=1',
        {
          total_units,
        },
      )
      .andWhere(
        !isNullableValue(year_built)
          ? `${alias}.year_built = :year_built`
          : '1=1',
        { year_built },
      );

    this.paginationService.applyOrderByFilters(alias, queryBuilder, {
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
