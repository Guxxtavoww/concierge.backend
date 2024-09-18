import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { optionalUuidSchema } from 'src/shared/schemas.shared';
import { createPaginationSchema } from 'src/utils/create-pagination-schema.utils';

import { MembershipInvitationStatus } from '../../enums/membership-invitation-status.enum';
import { optionalMembershipInvitationStatusSchema } from '../../schemas/membership-invitation-status.schemas';

export const paginateMembershipInvitationsSchema = createPaginationSchema({
  user_id: optionalUuidSchema,
  condominium_id: optionalUuidSchema,
  membership_invitation_status: optionalMembershipInvitationStatusSchema,
});

export type PaginateMembershipInvitationsType = z.infer<
  typeof paginateMembershipInvitationsSchema
>;

export class PaginateMembershipInvitationsDTO extends createZodDto(
  paginateMembershipInvitationsSchema,
) {
  @ApiPropertyOptional()
  user_id?: string;

  @ApiPropertyOptional()
  condominium_id?: string;

  @ApiPropertyOptional({ enum: MembershipInvitationStatus })
  membership_invitation_status?: MembershipInvitationStatus;
}
