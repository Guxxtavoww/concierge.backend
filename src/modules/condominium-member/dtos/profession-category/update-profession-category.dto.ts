import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { optionalStringSchema } from 'src/shared/schemas.shared';

export const updateProfessionCategorySchema = z.object({
  category_name: optionalStringSchema,
  category_description: optionalStringSchema,
});

export type UpdateProfessionCategoryPayload = z.infer<
  typeof updateProfessionCategorySchema
>;

export class UpdateProfessionCategoryDTO extends createZodDto(
  updateProfessionCategorySchema,
) {
  @ApiPropertyOptional({ example: 'Pedreiro' })
  category_name?: string;

  @ApiPropertyOptional({ example: 'bem forte kkkkk' })
  category_description?: string;
}
