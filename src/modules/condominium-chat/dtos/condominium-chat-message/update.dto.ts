import { z } from 'nestjs-zod/z';

import { stringSchema, uuidSchema } from 'src/shared/schemas.shared';
import { createNullableTransform } from 'src/utils/create-nullable-transform.util';

import { maxLengthForMessageText } from '../../entities/condominium-chat-message.entity';

export const updateCondominiumChatMessageSchema = z.object({
  message_text: createNullableTransform(
    stringSchema.max(maxLengthForMessageText),
  ),
  message_id: uuidSchema,
  member_id: uuidSchema,
});

export type UpdateCondominiumChatMessageType = z.infer<
  typeof updateCondominiumChatMessageSchema
>;
