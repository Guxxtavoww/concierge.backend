import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  uuidSchema,
  optionalUuidSchema,
  optionalStringSchema,
} from 'src/shared/schemas.shared';
import { createPaginationSchema } from 'src/utils/create-pagination-schema.utils';

export const paginateCondominiumChatMessagesSchema = createPaginationSchema({
  sended_by_id: optionalUuidSchema,
  message_text: optionalStringSchema,
  condominium_chat_id: uuidSchema,
});

export type PaginateCondominiumChatMessagesType = z.infer<
  typeof paginateCondominiumChatMessagesSchema
>;

export class PaginateCondominiumChatMessagesDTO extends createZodDto(
  paginateCondominiumChatMessagesSchema,
) {
  @ApiPropertyOptional()
  message_text?: string;

  @ApiPropertyOptional()
  sended_by_id?: string;

  @ApiProperty()
  condominium_chat_id: string;
}
