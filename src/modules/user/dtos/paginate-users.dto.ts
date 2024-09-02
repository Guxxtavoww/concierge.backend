import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { optionalStringSchemaToLowerCase } from 'src/shared/schemas.shared';
import { createPaginationSchema } from 'src/utils/create-pagination-schema.utils';

import { UserRole } from '../enums/user-role.enum';
import { optionalUserRoleSchema } from '../schemas/user-role.schema';

export const paginateUsersSchema = createPaginationSchema({
  user_name: optionalStringSchemaToLowerCase,
  user_role: optionalUserRoleSchema,
});

export type PaginateUsersPayload = z.infer<typeof paginateUsersSchema>;

export class PaginateUsersDTO extends createZodDto(paginateUsersSchema) {
  @ApiPropertyOptional({ type: String, description: 'Optional user name' })
  user_name?: string;

  @ApiPropertyOptional({
    type: 'enum',
    description: 'Optional User Role',
    enum: UserRole,
    example: UserRole.TENANT,
  })
  user_role?: UserRole;
}
