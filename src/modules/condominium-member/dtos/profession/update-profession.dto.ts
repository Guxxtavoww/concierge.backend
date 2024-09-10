import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  optionalIntegerNumberSchema,
  optionalStringSchema,
} from 'src/shared/schemas.shared';

export const updateProfessionSchema = z.object({
  name: optionalStringSchema,
  description: optionalStringSchema,
  profession_category_id: optionalIntegerNumberSchema,
});

export type UpdateProfessionPayload = z.infer<typeof updateProfessionSchema>;

export class UpdateProfessionDTO extends createZodDto(updateProfessionSchema) {
  @ApiPropertyOptional({ example: 'Pedreiro' })
  name?: string;

  @ApiPropertyOptional({ example: 'bem forte kkkkk' })
  description?: string;

  @ApiPropertyOptional({ type: Number })
  profession_category_id?: number;
}
