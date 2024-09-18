import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { optionalBooleanSchema, uuidSchema } from 'src/shared/schemas.shared';

export const sendMembershipInvitationSchema = z.object({
  user_id: uuidSchema,
  is_tenant: optionalBooleanSchema.default(false),
});

export type SendMembershipInvitationType = z.infer<
  typeof sendMembershipInvitationSchema
>;

export class SendMembershipInvitationDTO extends createZodDto(
  sendMembershipInvitationSchema,
) {
  @ApiProperty()
  user_id: string;

  @ApiProperty({ type: Boolean })
  is_tenant: boolean;
}
