import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import { booleanSchema } from 'src/shared/schemas.shared';

export const updateIsTenantSchema = z.object({
  is_tenant: booleanSchema,
});

export type UpdateIsTenantType = z.infer<typeof updateIsTenantSchema>;

export class UpdateIsTenantDTO extends createZodDto(updateIsTenantSchema) {
  @ApiProperty({ type: Boolean })
  is_tenant: boolean;
}
