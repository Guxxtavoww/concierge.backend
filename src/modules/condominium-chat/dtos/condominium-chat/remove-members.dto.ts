import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiBody } from '@nestjs/swagger';

import { uuidSchema } from 'src/shared/schemas.shared';

export const removeCondominiumChatMemberSchema = z.array(uuidSchema).min(1);

export type RemoveCondominiumChatMemberType = z.infer<
  typeof removeCondominiumChatMemberSchema
>;

export class RemoveCondominiumChatMemberDTO extends createZodDto(
  removeCondominiumChatMemberSchema,
) {}

export function RemoveCondominiumChatMemberSwagger() {
  return ApiBody({
    type: RemoveCondominiumChatMemberDTO,
    examples: {
      a: {
        summary: 'Sample request',
        value: ['id1', 'id2'],
      },
    },
  });
}
