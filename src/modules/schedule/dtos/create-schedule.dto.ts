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

export const createScheduleSchema = z.object({
  schedule_title: stringSchema,
  schedule_description: optionalStringSchema,
  schedule_type: scheduleTypeSchema,
  scheduled_datetime: futureDatetimeSchema,
  is_private: optionalBooleanSchema.default(false),
  participant_limit: optionalIntegerNumberSchema,
  condominium_id: uuidSchema,
});

export type CreateSchedulePayload = z.infer<typeof createScheduleSchema>;

export type CreateSchedule = CreateSchedulePayload & {
  created_by_id: string;
  invites?: ScheduleInvite[];
};

export class CreateScheduleDTO extends createZodDto(createScheduleSchema) {
  @ApiProperty()
  schedule_title: string;

  @ApiPropertyOptional()
  schedule_description?: string;

  @ApiProperty({ enum: ScheduleType, example: ScheduleType.MEETING })
  schedule_type: ScheduleType;

  @ApiProperty({ example: new Date().toISOString() })
  scheduled_datetime: string;

  @ApiPropertyOptional({ type: Boolean, default: false })
  is_private: boolean;

  @ApiPropertyOptional({ type: Number })
  participant_limit?: number;

  // esse id é invalido
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  condominium_id: string;
}
