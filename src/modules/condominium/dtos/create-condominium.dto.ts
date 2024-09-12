import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  stringSchema,
  optionalBooleanSchema,
  integerNumberSchema,
  optionalStringSchema,
  optionalFloatNumberSchema,
  optionalIntegerNumberSchema,
} from 'src/shared/schemas.shared';

const booleanToFalseSchema = optionalBooleanSchema.default(false);

export const createCondominiumSchema = z.object({
  condominium_name: stringSchema,
  description: optionalStringSchema,
  address: stringSchema,
  city: stringSchema,
  state: stringSchema,
  parking_spots: optionalIntegerNumberSchema,
  monthly_fee: optionalFloatNumberSchema,
  has_grill: booleanToFalseSchema,
  has_pool: booleanToFalseSchema,
  has_park: booleanToFalseSchema,
  has_security: booleanToFalseSchema,
  has_gym: booleanToFalseSchema,
  has_garden: booleanToFalseSchema,
  max_tenants_amount: integerNumberSchema,
  total_units: optionalIntegerNumberSchema,
  year_built: integerNumberSchema.refine((v) => v < new Date().getFullYear(), {
    message: 'Insert a valid year',
  }),
});

export type CreateCondominiumType = z.infer<typeof createCondominiumSchema>;

export class CreateCondominiumDTO extends createZodDto(
  createCondominiumSchema,
) {
  @ApiProperty({ description: 'The name of the condominium.' })
  condominium_name: string;

  @ApiPropertyOptional({
    description: 'A brief description of the condominium.',
  })
  description?: string;

  @ApiProperty({ description: 'The address of the condominium.' })
  address: string;

  @ApiProperty({ description: 'The city where the condominium is located.' })
  city: string;

  @ApiProperty({ description: 'The state where the condominium is located.' })
  state: string;

  @ApiPropertyOptional({
    description: 'The number of parking spots available in the condominium.',
  })
  parking_spots?: number;

  @ApiPropertyOptional({
    description: 'The monthly fee associated with the condominium.',
    example: 1800.00,
  })
  monthly_fee?: number;

  @ApiProperty({
    description: 'Indicates whether the condominium has a grill area.',
    default: false,
  })
  has_grill: boolean;

  @ApiProperty({
    description: 'Indicates whether the condominium has a grill area.',
    default: false,
  })
  has_garden: boolean;

  @ApiProperty({
    description: 'Indicates whether the condominium has a swimming pool.',
    default: false,
  })
  has_pool: boolean;

  @ApiProperty({
    description: 'Indicates whether the condominium has a park.',
    default: false,
  })
  has_park: boolean;

  @ApiProperty({
    description: 'Indicates whether the condominium has security services.',
    default: false,
  })
  has_security: boolean;

  @ApiProperty({
    description: 'Indicates whether the condominium has gym services.',
    default: false,
  })
  has_gym: boolean;

  @ApiProperty({
    description: 'The maximum number of tenants allowed in the condominium.',
  })
  max_tenants_amount: number;

  @ApiPropertyOptional({
    description: 'The total number of units in the condominium.',
  })
  total_units?: number;

  @ApiProperty({ description: 'The year the condominium was built.' })
  year_built: number;
}
