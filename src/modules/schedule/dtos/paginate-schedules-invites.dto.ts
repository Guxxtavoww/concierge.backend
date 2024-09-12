import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { optionalUuidSchema } from 'src/shared/schemas.shared';
import { createPaginationSchema } from 'src/utils/create-pagination-schema.utils';

import { ScheduleInviteStatus } from '../enums/schedule-invite-status.enum';
import { optionalScheduleInviteStatusSchema } from '../schemas/schedule-invite-status.schema';

export const paginateSchedulesInvitesSchema = createPaginationSchema({
  schedule_id: optionalUuidSchema,
  condominium_member_id: optionalUuidSchema,
  schedule_invite_status: optionalScheduleInviteStatusSchema,
}).refine((data) => data.condominium_member_id || data.schedule_id, {
  message: 'Insert at least a condominium member id or the schedule id',
});

export type PaginateSchedulesInvitesType = z.infer<
  typeof paginateSchedulesInvitesSchema
>;

export class PaginateSchedulesInvitesDTO extends createZodDto(
  paginateSchedulesInvitesSchema,
) {
  @ApiPropertyOptional()
  schedule_id?: string;

  @ApiPropertyOptional()
  condominium_member_id?: string;

  @ApiPropertyOptional({ enum: ScheduleInviteStatus })
  schedule_invite_status?: ScheduleInviteStatus;
}
