import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import { uuidSchema } from 'src/shared/schemas.shared';
import { createPaginationSchema } from 'src/utils/create-pagination-schema.utils';

export const paginateScheduleParticipantsSchema = createPaginationSchema({
  schedule_id: uuidSchema,
});

export type PaginateScheduleParticipantsType = z.infer<
  typeof paginateScheduleParticipantsSchema
>;

export class PaginateScheduleParticipantsDTO extends createZodDto(
  paginateScheduleParticipantsSchema,
) {
  @ApiProperty()
  schedule_id: string;
}
