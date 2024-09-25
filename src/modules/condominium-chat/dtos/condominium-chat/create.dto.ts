import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import { stringSchema, uuidSchema } from 'src/shared/schemas.shared';

export const createCondominiumChatSchema = z.object({
  chat_title: stringSchema,
  chat_description: stringSchema,
  members_ids: z.array(uuidSchema).default([]),
});

export type CreateCondominiumChatType = z.infer<
  typeof createCondominiumChatSchema
>;

export class CreateCondominiumChatDTO extends createZodDto(
  createCondominiumChatSchema,
) {
  @ApiProperty()
  chat_title: string;

  @ApiProperty()
  chat_description: string;

  @ApiProperty({ example: ['id'] })
  members_ids: string[];
}
