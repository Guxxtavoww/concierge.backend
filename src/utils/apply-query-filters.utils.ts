import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import type { OrderBy } from 'src/shared/schemas.shared';

import { isNullableValue } from './is-nullable-value.util';

export type FilterTypes = 'LIKE' | '=' | '<' | '>' | '<=' | '>=';
export type Filter = Record<string, Maybe<string | number | Date | boolean>>;

export function applyQueryFilters<
  Alias extends string,
  Entity extends ObjectLiteral,
  Filters extends Filter,
  FilterType extends Record<keyof Filters, FilterTypes>,
>(
  alias: Alias,
  queryBuilder: SelectQueryBuilder<Entity>,
  filters: Filters,
  filters_types: FilterType,
): void {
  if (Object.keys(filters).length === 0) return;

  let index: number = 0;

  for (const [filter, value] of Object.entries(filters) as [
    keyof Filters,
    Filters[keyof Filters],
  ][]) {
    if (isNullableValue(value) || value === '') continue;

    const stringfyedFilterKey = String(filter);
    const filterType = filters_types[filter] as FilterTypes;
    const parameterKey = `${stringfyedFilterKey}_${index}`;
    const aliasWithFilter = `${alias}.${stringfyedFilterKey}`;
    const condition = `${filterType === 'LIKE' ? `LOWER(${aliasWithFilter})` : aliasWithFilter} ${filterType} :${parameterKey}`;

    if (!filterType) {
      throw new Error(
        `Invalid filter type provided for filter: ${stringfyedFilterKey}`,
      );
    }

    queryBuilder[index === 0 ? 'where' : 'andWhere'](condition, {
      [parameterKey]:
        filterType === 'LIKE' && typeof value === 'string'
          ? `%${value}%`
          : value,
    });

    index++;
  }
}

export interface OrderByParams {
  order_by_created_at: OrderBy;
  order_by_updated_at: OrderBy;
}

export function applyOrderByFilters<T extends string, E extends ObjectLiteral>(
  alias: T,
  queryBuilder: SelectQueryBuilder<E>,
  { order_by_created_at, order_by_updated_at }: OrderByParams,
) {
  if (order_by_created_at)
    queryBuilder.orderBy(`${alias}.created_at`, order_by_created_at);

  if (order_by_updated_at)
    queryBuilder.orderBy(`${alias}.updated_at`, order_by_updated_at);
}
