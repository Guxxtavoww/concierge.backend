import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { optionalStringSchema } from 'src/shared/schemas.shared';

export const updateCondominiumChatSchema = z.object({
  chat_title: optionalStringSchema,
  chat_description: optionalStringSchema,
});

export type UpdateCondominiumChatType = z.infer<
  typeof updateCondominiumChatSchema
>;

export class UpdateCondominiumChatDTO extends createZodDto(
  updateCondominiumChatSchema,
) {
  @ApiPropertyOptional()
  chat_title?: string;

  @ApiPropertyOptional()
  chat_description?: string;
}
