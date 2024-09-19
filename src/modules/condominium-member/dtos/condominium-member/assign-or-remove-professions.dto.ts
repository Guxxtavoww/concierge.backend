import { ApiBody } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

import { integerNumberSchema } from 'src/shared/schemas.shared';

export const assignOrRemoveProfessionsSchema = z.array(integerNumberSchema);

export type AssignOrRemoveProfessionsType = z.infer<
  typeof assignOrRemoveProfessionsSchema
>;

export class AssignOrRemoveProfessionsDTO extends createZodDto(
  assignOrRemoveProfessionsSchema,
) {}

export function AssignOrRemoveSwagger() {
  return ApiBody({
    type: AssignOrRemoveProfessionsDTO,
    examples: {
      a: {
        summary: 'Sample request',
        value: [12, 13],
      },
    },
  });
}
