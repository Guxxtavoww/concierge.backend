import { z } from 'nestjs-zod/z';

import { stringSchema, uuidSchema } from 'src/shared/schemas.shared';

import { maxLengthForMessageText } from '../../entities/condominium-chat-message.entity';

export const createCondominiumChatMessageSchema = z.object({
  message_text: stringSchema.max(maxLengthForMessageText),
  condominium_chat_id: uuidSchema,
  sended_by_id: uuidSchema,
});

export type CreateCondominiumChatMessageType = z.infer<
  typeof createCondominiumChatMessageSchema
>;