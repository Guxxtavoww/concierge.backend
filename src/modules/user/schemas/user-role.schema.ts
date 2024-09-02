import { z } from 'nestjs-zod/z';

import { createNullableTransform } from 'src/utils/create-nullable-transform.util';

import { UserRole } from '../enums/user-role.enum';

export const userRoleSchema = z.nativeEnum(UserRole);

export const optionalUserRoleSchema = createNullableTransform(userRoleSchema);
