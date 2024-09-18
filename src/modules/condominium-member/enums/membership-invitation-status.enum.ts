export enum MembershipInvitationStatus {
  SENT = 'enviada',
  ACCEPTED = 'aceita',
  DECLINED = 'recusada',
}

export const membership_invitaion_statuses = Object.values(
  MembershipInvitationStatus,
);
