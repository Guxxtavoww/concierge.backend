import {
  type IPaginationMeta,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { Injectable } from '@nestjs/common';
import {
  type ObjectLiteral,
  Repository,
  type FindOptionsWhere,
  type FindManyOptions,
  SelectQueryBuilder,
} from 'typeorm';

import type { OrderBy } from 'src/shared/schemas.shared';

@Injectable()
export class PaginationService {
  public async paginate<T extends ObjectLiteral>(
    entityRepository: Repository<T>,
    { limit, page, ...options }: PaginationArgs,
    searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>,
  ): Promise<Pagination<T, IPaginationMeta>> {
    return paginate<T>(
      entityRepository,
      {
        ...options,
        limit,
        page,
      },
      searchOptions,
    );
  }

  public async paginateWithQueryBuilder<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    { limit, page, ...options }: PaginationArgs,
  ): Promise<Pagination<T, IPaginationMeta>> {
    return paginate<T>(queryBuilder, {
      ...options,
      limit,
      page,
    });
  }

  public applyOrderByFilters<T extends string, E extends ObjectLiteral>(
    alias: T,
    queryBuilder: SelectQueryBuilder<E>,
    {
      order_by_created_at,
      order_by_updated_at,
    }: { order_by_created_at: OrderBy; order_by_updated_at: OrderBy },
  ) {
    if (order_by_created_at)
      queryBuilder.orderBy(`${alias}.created_at`, order_by_created_at);

    if (order_by_updated_at)
      queryBuilder.orderBy(`${alias}.updated_at`, order_by_updated_at);
  }
}
