import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  optionalStringSchema,
  optionalBooleanSchema,
  optionalFloatNumberSchema,
  optionalIntegerNumberSchema,
  optionalStringToIntegerSchema,
} from 'src/shared/schemas.shared';
import { isNullableValue } from 'src/utils/is-nullable-value.util';

export const updateCondominiumSchema = z.object({
  condominium_name: optionalStringSchema,
  description: optionalStringSchema,
  address: optionalStringSchema,
  city: optionalStringSchema,
  state: optionalStringSchema,
  parking_spots: optionalIntegerNumberSchema,
  monthly_fee: optionalFloatNumberSchema,
  has_grill: optionalBooleanSchema,
  has_pool: optionalBooleanSchema,
  has_park: optionalBooleanSchema,
  has_security: optionalBooleanSchema,
  has_gym: optionalBooleanSchema,
  max_tenants_amount: optionalIntegerNumberSchema,
  total_units: optionalIntegerNumberSchema,
  year_built: optionalStringToIntegerSchema.refine((v) =>
    !isNullableValue(v) ? v < new Date().getFullYear() : true,
  ),
});

export type UpdateCondominiumType = z.infer<typeof updateCondominiumSchema>;

export class UpdateCondominiumDTO extends createZodDto(
  updateCondominiumSchema,
) {
  @ApiPropertyOptional({ description: 'The name of the condominium.' })
  condominium_name?: string;

  @ApiPropertyOptional({
    description: 'A brief description of the condominium.',
  })
  description?: string;

  @ApiPropertyOptional({ description: 'The address of the condominium.' })
  address?: string;

  @ApiPropertyOptional({
    description: 'The city where the condominium is located.',
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'The state where the condominium is located.',
  })
  state?: string;

  @ApiPropertyOptional({
    description: 'The number of parking spots available in the condominium.',
  })
  parking_spots?: number;

  @ApiPropertyOptional({
    description: 'The monthly fee associated with the condominium.',
  })
  monthly_fee?: number;

  @ApiPropertyOptional({
    description: 'Indicates whether the condominium has a grill area.',
    default: false,
  })
  has_grill?: boolean;

  @ApiPropertyOptional({
    description: 'Indicates whether the condominium has a swimming pool.',
    default: false,
  })
  has_pool?: boolean;

  @ApiPropertyOptional({
    description: 'Indicates whether the condominium has a park.',
    default: false,
  })
  has_park?: boolean;

  @ApiPropertyOptional({
    description: 'Indicates whether the condominium has security services.',
    default: false,
  })
  has_security?: boolean;

  @ApiPropertyOptional({
    description: 'Indicates whether the condominium has gym services.',
    default: false,
  })
  has_gym?: boolean;

  @ApiPropertyOptional({
    description: 'The maximum number of tenants allowed in the condominium.',
  })
  max_tenants_amount?: number;

  @ApiPropertyOptional({
    description: 'The total number of units in the condominium.',
  })
  total_units?: number;

  @ApiPropertyOptional({ description: 'The year the condominium was built.' })
  year_built?: number;
}
