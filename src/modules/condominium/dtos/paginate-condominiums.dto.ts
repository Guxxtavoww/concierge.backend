import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  optionalStringSchemaToLowerCase,
  optionalBooleanStringSchema,
  optionalStringToFloatSchema,
  optionalStringToIntegerSchema,
  optionalStringSchema,
  optionalOrderParamSchema,
} from 'src/shared/schemas.shared';
import { isNullableValue } from 'src/utils/is-nullable-value.util';
import { createPaginationSchema } from 'src/utils/create-pagination-schema.utils';
import { OrderByEnum } from 'src/shared/enums.shared';

export const paginateCondominiumsSchema = createPaginationSchema({
  condominium_name: optionalStringSchemaToLowerCase,
  description: optionalStringSchemaToLowerCase,
  address: optionalStringSchemaToLowerCase,
  city: optionalStringSchema,
  state: optionalStringSchema,
  monthly_fee: optionalStringToFloatSchema,
  has_grill: optionalBooleanStringSchema,
  has_pool: optionalBooleanStringSchema,
  has_park: optionalBooleanStringSchema,
  has_security: optionalBooleanStringSchema,
  has_gym: optionalBooleanStringSchema,
  max_tenants_amount: optionalStringToIntegerSchema,
  total_units: optionalStringToIntegerSchema,
  year_built: optionalStringToIntegerSchema.refine((v) =>
    !isNullableValue(v) ? v < new Date().getFullYear() : true,
  ),
  order_by_total_member_count: optionalOrderParamSchema,
});

export type PaginateCondominiumsType = z.infer<
  typeof paginateCondominiumsSchema
>;

export class PaginateCondominiumsDTO extends createZodDto(
  paginateCondominiumsSchema,
) {
  @ApiPropertyOptional({
    type: String,
    description: 'The name of the condominium',
  })
  condominium_name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Description of the condominium',
  })
  description?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Address of the condominium',
  })
  address?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'City where the condominium is located',
  })
  city?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'State where the condominium is located',
  })
  state?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Monthly fee of the condominium',
  })
  monthly_fee?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Indicates if the condominium has a grill',
  })
  has_grill?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Indicates if the condominium has a pool',
  })
  has_pool?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Indicates if the condominium has a park',
  })
  has_park?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Indicates if the condominium has security',
  })
  has_security?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Indicates if the condominium has a gym',
  })
  has_gym?: boolean;

  @ApiPropertyOptional({
    type: Number,
    description: 'Maximum number of tenants allowed in the condominium',
  })
  max_tenants_amount?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Total number of units in the condominium',
  })
  total_units?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Year the condominium was built',
  })
  year_built?: number;

  @ApiPropertyOptional({
    enum: OrderByEnum,
  })
  order_by_total_member_count?: 'ASC' | 'DESC';
}
