import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  uuidSchema,
  stringSchema,
  futureDatetimeSchema,
  optionalStringSchema,
  optionalBooleanSchema,
  optionalIntegerNumberSchema,
} from 'src/shared/schemas.shared';

import { ScheduleType } from '../enums/schedule-type.enum';
import { ScheduleInvite } from '../entities/schedule-invite.entity';
import { scheduleTypeSchema } from '../schemas/schedule-type.schema';

export const createScheduleSchema = z
  .object({
    schedule_title: stringSchema,
    schedule_description: optionalStringSchema,
    schedule_type: scheduleTypeSchema,
    scheduled_datetime_start: futureDatetimeSchema,
    scheduled_datetime_end: futureDatetimeSchema,
    is_private: optionalBooleanSchema.default(false),
    participant_limit: optionalIntegerNumberSchema,
    condominium_id: uuidSchema,
  })
  .refine(
    (data) => {
      if (
        new Date(data.scheduled_datetime_start) >=
        new Date(data.scheduled_datetime_end) 
      )
        return false;

      return true;
    },
    { message: 'Start date must be before the end date' },
  );

export type CreateSchedulePayload = z.infer<typeof createScheduleSchema>;

export type CreateSchedule = CreateSchedulePayload & {
  created_by_id: string;
  invites?: ScheduleInvite[];
};

const date = new Date();

function getStartDate() {
  date.setMinutes(date.getMinutes() + 2);

  return date.toISOString()
}

function getEndDate() {
  date.setMinutes(date.getMinutes() + 3);

  return date.toISOString()
}

export class CreateScheduleDTO extends createZodDto(createScheduleSchema) {
  @ApiProperty()
  schedule_title: string;

  @ApiPropertyOptional()
  schedule_description?: string;

  @ApiProperty({ enum: ScheduleType, example: ScheduleType.MEETING })
  schedule_type: ScheduleType;

  @ApiProperty({ example: getStartDate() })
  scheduled_datetime_start: string;

  @ApiProperty({ example: getEndDate() })
  scheduled_datetime_end: string;

  @ApiPropertyOptional({ type: Boolean, default: false })
  is_private: boolean;

  @ApiPropertyOptional({ type: Number })
  participant_limit?: number;

  // esse id é invalido
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  condominium_id: string;
}
