import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import { optionalBooleanSchema, uuidSchema } from 'src/shared/schemas.shared';

export const createCondominiumMemberSchema = z.object({
  condominium_id: uuidSchema,
  is_tenant: optionalBooleanSchema.default(false),
});

export type CreateCondominiumMemberPayload = z.infer<
  typeof createCondominiumMemberSchema
>;

export class CreateCondominiumMemberDTO extends createZodDto(
  createCondominiumMemberSchema,
) {
  @ApiProperty({ description: 'The id of the condominium.' })
  condominium_id: string;

  @ApiProperty()
  is_tenant: boolean;
}
