import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  integerNumberSchema,
  optionalStringSchema,
  stringSchema,
} from 'src/shared/schemas.shared';

export const createProfessionSchema = z.object({
  name: stringSchema,
  description: optionalStringSchema,
  profession_category_id: integerNumberSchema,
});

export type CreateProfessionPayload = z.infer<typeof createProfessionSchema>;

export class CreateProfessionDTO extends createZodDto(createProfessionSchema) {
  @ApiProperty({ example: 'Pedreiro' })
  name: string;

  @ApiPropertyOptional({ example: 'bem forte kkkkk' })
  description?: string;

  @ApiProperty({ type: Number })
  profession_category_id: number;
}
