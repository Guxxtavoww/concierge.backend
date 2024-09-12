import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import { uuidSchema } from 'src/shared/schemas.shared';

export const sendScheduleInviteSchema = z.object({
  schedule_id: uuidSchema,
  condominium_id: uuidSchema,
  condominium_member_id: uuidSchema,
});

export type SendScheduleInvitePayload = z.infer<
  typeof sendScheduleInviteSchema
>;

export class SendScheduleInviteDTO extends createZodDto(
  sendScheduleInviteSchema,
) {
  @ApiProperty()
  schedule_id: string;

  @ApiProperty()
  condominium_id: string;

  @ApiProperty()
  condominium_member_id: string
}
