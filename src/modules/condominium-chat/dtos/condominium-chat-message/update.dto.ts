import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { stringSchema } from 'src/shared/schemas.shared';
import { createNullableTransform } from 'src/utils/create-nullable-transform.util';

import { maxLengthForMessageText } from '../../entities/condominium-chat-message.entity';

export const updateCondominiumChatMessageSchema = z.object({
  message_text: createNullableTransform(
    stringSchema.max(maxLengthForMessageText),
  ),
});

export type UpdateCondominiumChatMessageType = z.infer<
  typeof updateCondominiumChatMessageSchema
>;

export class UpdateCondominiumChatMessageDTO extends createZodDto(
  updateCondominiumChatMessageSchema,
) {
  @ApiPropertyOptional()
  message_text?: string;
}
