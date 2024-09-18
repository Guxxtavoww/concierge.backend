import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';

import { sendMembershipInvitationSchema } from './send-membership-invitation.dto';

export const bulkMembershipInvitationsSchema = z.array(
  sendMembershipInvitationSchema,
);

export type BulkMembershipInvitationsType = z.infer<
  typeof bulkMembershipInvitationsSchema
>;

export class BulkMembershipInvitationsDTO extends createZodDto(
  bulkMembershipInvitationsSchema,
) {}
