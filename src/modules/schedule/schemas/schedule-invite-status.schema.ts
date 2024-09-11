import { z } from 'nestjs-zod/z';

import { createNullableTransform } from 'src/utils/create-nullable-transform.util';

import { ScheduleInviteStatus } from '../enums/schedule-invite-status.enum';

export const scheduleInviteStatusSchema = z.nativeEnum(ScheduleInviteStatus);

export const optionalScheduleInviteStatusSchema = createNullableTransform(
  scheduleInviteStatusSchema,
);
