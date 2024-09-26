import { z } from 'nestjs-zod/z';

import { uuidSchema } from 'src/shared/schemas.shared';

export const deleteChatMessageSchema = z.object({
  message_id: uuidSchema,
  member_id: uuidSchema,
});

export type DeleteChatMessageType = z.infer<typeof deleteChatMessageSchema>;
