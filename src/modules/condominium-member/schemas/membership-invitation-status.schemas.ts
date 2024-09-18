import { z } from 'nestjs-zod/z';

import { createNullableTransform } from 'src/utils/create-nullable-transform.util';

import { MembershipInvitationStatus } from '../enums/membership-invitation-status.enum';

export const membershipInvitationStatusSchema = z.nativeEnum(
  MembershipInvitationStatus,
);

export const optionalMembershipInvitationStatusSchema = createNullableTransform(
  membershipInvitationStatusSchema,
);
