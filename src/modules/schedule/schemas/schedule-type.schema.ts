import { z } from 'nestjs-zod/z';

import { createNullableTransform } from 'src/utils/create-nullable-transform.util';

import { ScheduleType } from '../enums/schedule-type.enum';

export const scheduleTypeSchema = z.nativeEnum(ScheduleType);

export const optionalScheduleTypeSchema =
  createNullableTransform(scheduleTypeSchema);
