import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { stringSchema, optionalStringSchema } from 'src/shared/schemas.shared';

export const createProfessionCategorySchema = z.object({
  category_name: stringSchema,
  category_description: optionalStringSchema,
});

export type CreateProfessionCategoryPayload = z.infer<
  typeof createProfessionCategorySchema
>;

export class CreateProfessionCategoryDTO extends createZodDto(
  createProfessionCategorySchema,
) {
  @ApiProperty({ example: 'Pedreiro' })
  category_name: string;

  @ApiPropertyOptional({ example: 'bem forte kkkkk' })
  category_description?: string;
}
