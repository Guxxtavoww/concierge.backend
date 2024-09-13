import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  type OrderBy,
  optionalOrderParamSchema,
  optionalStringSchemaToLowerCase,
  optionalStringToIntegerSchema,
} from 'src/shared/schemas.shared';
import { OrderByEnum } from 'src/shared/enums.shared';

export const listProfessionsSchema = z.object({
  name: optionalStringSchemaToLowerCase,
  description: optionalStringSchemaToLowerCase,
  profession_category_id: optionalStringToIntegerSchema,
  order_by_created_at: optionalOrderParamSchema,
  order_by_updated_at: optionalOrderParamSchema,
});

export type ListProfessionsPayload = z.infer<typeof listProfessionsSchema>;

export class ListProfessionsDTO extends createZodDto(listProfessionsSchema) {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ type: Number })
  profession_category_id?: number;

  @ApiPropertyOptional({ enum: OrderByEnum })
  order_by_created_at?: OrderBy;

  @ApiPropertyOptional({ enum: OrderByEnum })
  order_by_updated_at?: OrderBy;
}
