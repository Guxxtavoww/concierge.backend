import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import {
  uuidSchema,
  optionalBooleanSchema,
} from 'src/shared/schemas.shared';


export const createCondominiumMemberSchema = z.object({
  is_tenant: optionalBooleanSchema.default(false),
  user_id: uuidSchema,
});

export type CreateCondominiumMemberPayload = z.infer<
  typeof createCondominiumMemberSchema
>;

export class CreateCondominiumMemberDTO extends createZodDto(
  createCondominiumMemberSchema,
) {
  @ApiProperty({ type: Boolean })
  is_tenant: boolean;

  @ApiProperty()
  user_id: string;
}
