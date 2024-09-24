import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import { stringSchema, uuidSchema } from 'src/shared/schemas.shared';

import { maxLengthForMessageText } from '../../entities/condominium-chat-message.entity';

export const createCondominiumChatMessageSchema = z.object({
  message_text: stringSchema.max(maxLengthForMessageText),
  condominium_chat_id: uuidSchema,
});

export type CreateCondominiumChatMessageType = z.infer<
  typeof createCondominiumChatMessageSchema
>;

export class CreateCondominiumChatMessageDTO extends createZodDto(
  createCondominiumChatMessageSchema,
) {
  @ApiProperty()
  message_text: string;

  @ApiProperty()
  condominium_chat_id: string;
}
