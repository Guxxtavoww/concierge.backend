import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  optionalOrderParamSchema,
  optionalStringSchemaToLowerCase,
} from 'src/shared/schemas.shared';
import { OrderByEnum } from 'src/shared/enums.shared';

export const listProfessionsCategoriesSchema = z.object({
  category_name: optionalStringSchemaToLowerCase,
  category_description: optionalStringSchemaToLowerCase,
  order_by_created_at: optionalOrderParamSchema,
  order_by_updated_at: optionalOrderParamSchema,
});

export type ListProfessionsCategoriesPayload = z.infer<
  typeof listProfessionsCategoriesSchema
>;

export class ListProfessionsCategoriesDTO extends createZodDto(
  listProfessionsCategoriesSchema,
) {
  @ApiPropertyOptional()
  category_name?: string;

  @ApiPropertyOptional()
  category_description?: string;

  @ApiPropertyOptional({ enum: OrderByEnum })
  order_by_created_at?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ enum: OrderByEnum })
  order_by_updated_at?: 'ASC' | 'DESC';
}
