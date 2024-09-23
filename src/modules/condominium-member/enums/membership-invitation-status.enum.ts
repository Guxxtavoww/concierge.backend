export enum MembershipInvitationStatus {
  SENT = 'enviada',
  ACCEPTED = 'aceita',
  DECLINED = 'recusada',
}

export const membership_invitation_statuses = Object.values(
  MembershipInvitationStatus,
);
