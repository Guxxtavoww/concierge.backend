import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import {
  optionalUuidSchema,
  optionalFutureDatetimeSchema,
  optionalStringSchema,
  optionalBooleanSchema,
  optionalIntegerNumberSchema,
} from 'src/shared/schemas.shared';

import { ScheduleType } from '../enums/schedule-type.enum';
import { optionalScheduleTypeSchema } from '../schemas/schedule-type.schema';

export const updateScheduleSchema = z.object({
  schedule_title: optionalStringSchema,
  schedule_description: optionalStringSchema,
  schedule_type: optionalScheduleTypeSchema,
  scheduled_datetime_start: optionalFutureDatetimeSchema,
  scheduled_datetime_end: optionalFutureDatetimeSchema,
  is_private: optionalBooleanSchema,
  participant_limit: optionalIntegerNumberSchema,
  condominium_id: optionalUuidSchema,
});

export type UpdateSchedulePayload = z.infer<typeof updateScheduleSchema>;

export class UpdateScheduleDTO extends createZodDto(updateScheduleSchema) {
  @ApiPropertyOptional()
  schedule_title?: string;

  @ApiPropertyOptional()
  schedule_description?: string;

  @ApiPropertyOptional({ enum: ScheduleType, example: ScheduleType.MEETING })
  schedule_type?: ScheduleType;

  @ApiPropertyOptional({ example: new Date().toISOString() })
  scheduled_datetime_start?: string;

  @ApiPropertyOptional({ example: new Date().toISOString() })
  scheduled_datetime_end?: string;

  @ApiPropertyOptional({ type: Boolean })
  is_private?: boolean;

  @ApiPropertyOptional({ type: Number })
  participant_limit?: number;

  // esse id é invalido
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  condominium_id?: string;
}
