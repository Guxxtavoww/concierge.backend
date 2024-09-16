import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  optionalUuidSchema,
  optionalStringSchema,
  optionalOrderParamSchema,
  optionalBooleanStringSchema,
  optionalFutureDatetimeSchema,
  type OrderBy,
} from 'src/shared/schemas.shared';
import { OrderByEnum } from 'src/shared/enums.shared';
import { createPaginationSchema } from 'src/utils/create-pagination-schema.utils';

import { ScheduleType } from '../enums/schedule-type.enum';
import { ScheduleStatus } from '../enums/schedule-status.enum';
import { optionalScheduleTypeSchema } from '../schemas/schedule-type.schema';
import { optionalScheduleStatusSchema } from '../schemas/schedule-status.schema';

export const paginateSchedulesSchema = createPaginationSchema({
  schedule_title: optionalStringSchema,
  schedule_description: optionalStringSchema,
  schedule_status: optionalScheduleStatusSchema,
  schedule_type: optionalScheduleTypeSchema,
  scheduled_datetime_start: optionalFutureDatetimeSchema,
  scheduled_datetime_end: optionalFutureDatetimeSchema,
  is_private: optionalBooleanStringSchema,
  condominium_id: optionalUuidSchema,
  created_by_id: optionalUuidSchema,
  order_by_participant_limit: optionalOrderParamSchema,
})
  .refine((data) => data.condominium_id || data.created_by_id, {
    message: 'Pass at least a condominium id or the created by id',
  })
  .refine(
    ({ scheduled_datetime_end, scheduled_datetime_start }) => {
      if (!scheduled_datetime_end && !scheduled_datetime_start) return true;

      if (scheduled_datetime_end && scheduled_datetime_start) {
        const start = new Date(scheduled_datetime_start);
        const end = new Date(scheduled_datetime_end);

        return start < end;
      }

      return false;
    },
    { message: 'Start date must be before the end date' },
  );

export type PaginateSchedulesType = z.infer<typeof paginateSchedulesSchema>;

export class PaginateSchedulesDTO extends createZodDto(
  paginateSchedulesSchema,
) {
  @ApiPropertyOptional()
  schedule_title?: string;

  @ApiPropertyOptional()
  schedule_description?: string;

  @ApiPropertyOptional({ enum: ScheduleStatus })
  schedule_status?: ScheduleStatus;

  @ApiPropertyOptional({ enum: ScheduleType })
  schedule_type?: ScheduleType;

  @ApiPropertyOptional({ example: new Date().toISOString() })
  scheduled_datetime_start?: string;

  @ApiPropertyOptional({ example: new Date().toISOString() })
  scheduled_datetime_end?: string;

  @ApiPropertyOptional({ type: Boolean })
  is_private?: boolean;

  @ApiPropertyOptional({ enum: OrderByEnum })
  order_by_participant_limit?: OrderBy;

  @ApiPropertyOptional()
  created_by_id?: string;

  @ApiPropertyOptional()
  condominium_id?: string;
}
