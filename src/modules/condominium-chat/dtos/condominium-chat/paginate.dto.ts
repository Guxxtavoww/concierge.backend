import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  optionalUuidSchema,
  optionalOrderParamSchema,
  optionalStringSchemaToLowerCase,
} from 'src/shared/schemas.shared';
import { OrderByEnum } from 'src/shared/enums.shared';
import { createPaginationSchema } from 'src/utils/create-pagination-schema.utils';

export const paginateCondominiumChatsSchema = createPaginationSchema({
  admin_id: optionalUuidSchema,
  chat_title: optionalStringSchemaToLowerCase,
  chat_description: optionalStringSchemaToLowerCase,
  order_by_messages_amount: optionalOrderParamSchema,
  order_by_members_amount: optionalOrderParamSchema,
});

export type PaginateCondominiumChatsType = z.infer<
  typeof paginateCondominiumChatsSchema
>;

export class PaginateCondominiumChatsDTO extends createZodDto(
  paginateCondominiumChatsSchema,
) {
  @ApiPropertyOptional()
  chat_title?: string;

  @ApiPropertyOptional()
  chat_description?: string;

  @ApiPropertyOptional()
  admin_id?: string;

  @ApiPropertyOptional({ enum: OrderByEnum })
  order_by_messages_amount?: OrderByEnum;

  @ApiPropertyOptional({ enum: OrderByEnum })
  order_by_members_amount?: OrderByEnum;
}
