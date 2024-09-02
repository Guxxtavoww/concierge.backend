import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  stringSchema,
  emailStringSchema,
  optionalDateStringSchema,
  optionalPhoneNumberStringSchema,
} from 'src/shared/schemas.shared';

import { UserRole } from '../enums/user-role.enum';
import { userRoleSchema } from '../schemas/user-role.schema';

export const createUserSchema = z.object({
  user_name: stringSchema,
  user_email: emailStringSchema,
  password: stringSchema,
  phone_number: optionalPhoneNumberStringSchema,
  date_of_birth: optionalDateStringSchema,
  user_role: userRoleSchema,
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;

export class CreateUserDTO extends createZodDto(createUserSchema) {
  @ApiProperty({ type: String, description: 'User name' })
  user_name: string;

  @ApiProperty({ type: String, description: 'User email' })
  user_email: string;

  @ApiProperty({ type: String, description: 'User Role' })
  user_role: UserRole;

  @ApiPropertyOptional({ type: String, description: 'Optional password' })
  password: string;

  @ApiPropertyOptional({ type: String, example: '+919367788755' })
  phone_number?: string;

  @ApiProperty({ type: String, example: '2003-12-09' })
  date_of_birth: string;
}
