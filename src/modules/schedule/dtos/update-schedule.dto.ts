import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  scheduled_datetime: optionalFutureDatetimeSchema,
  is_private: optionalBooleanSchema,
  participant_limit: optionalIntegerNumberSchema,
  condominium_id: optionalUuidSchema,
});

export type UpdateSchedulePayload = z.infer<typeof updateScheduleSchema>;

export class UpdateScheduleDTO extends createZodDto(updateScheduleSchema) {
  @ApiProperty()
  schedule_title?: string;

  @ApiPropertyOptional()
  schedule_description?: string;

  @ApiProperty({ enum: ScheduleType, example: ScheduleType.MEETING })
  schedule_type?: ScheduleType;

  @ApiProperty({ example: new Date().toISOString() })
  scheduled_datetime?: string;

  @ApiPropertyOptional({ type: Boolean })
  is_private?: boolean;

  @ApiPropertyOptional({ type: Number })
  participant_limit?: number;

  // esse id é invalido
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  condominium_id?: string;
}
