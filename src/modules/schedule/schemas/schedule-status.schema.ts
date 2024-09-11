import { z } from 'nestjs-zod/z';

import { createNullableTransform } from 'src/utils/create-nullable-transform.util';

import { ScheduleStatus } from '../enums/schedule-status.enum';

export const scheduleStatusSchema = z.nativeEnum(ScheduleStatus);

export const optionalScheduleStatusSchema =
  createNullableTransform(scheduleStatusSchema);
