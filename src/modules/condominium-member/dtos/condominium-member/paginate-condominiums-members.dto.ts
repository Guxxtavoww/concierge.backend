import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  optionalUuidSchema,
  optionalBooleanStringSchema,
} from 'src/shared/schemas.shared';
import { createPaginationSchema } from 'src/utils/create-pagination-schema.utils';

export const paginateCondominiumsMembersSchema = createPaginationSchema({
  user_id: optionalUuidSchema,
  condominium_id: optionalUuidSchema,
  is_tenant: optionalBooleanStringSchema,
});

export type PaginateCondominiumsMembersPayload = z.infer<
  typeof paginateCondominiumsMembersSchema
>;

export class PaginateCondominiumsMembersDTO extends createZodDto(
  paginateCondominiumsMembersSchema,
) {
  @ApiPropertyOptional({
    type: String,
    description: 'The member user id',
  })
  user_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The member condominium id',
  })
  condominium_id?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Indicates if the member is a tenant',
  })
  is_tenant?: boolean;
}
