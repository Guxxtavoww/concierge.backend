import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import {
  alias,
  Condominium,
} from 'src/modules/condominium/entities/condominium.entity';
import { Base } from 'src/lib/database/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';

import { MembershipInvitationStatus } from '../enums/membership-invitation-status.enum';
import type { SendMembershipInvitationType } from '../dtos/membership-invitation/send-membership-invitation.dto';

@Entity('membership-invitations')
export class MembershipInvitation extends Base {
  @Index()
  @Column('uuid')
  user_id: string;

  @Index()
  @Column('uuid')
  condominium_id: string;

  @Index()
  @Column('enum', {
    enum: MembershipInvitationStatus,
    default: MembershipInvitationStatus.SENT,
  })
  membership_invitation_status: MembershipInvitationStatus;

  @Column('boolean', { default: false })
  is_tenant: boolean;

  @ManyToOne(() => Condominium, c => c.membership_invites)
  @JoinColumn({ name: 'condominium_id' })
  condominium: Condominium;

  @ManyToOne(() => User, u => u.memberships_invitations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  static create(
    payload: SendMembershipInvitationType & {
      condominium_id: string;
    },
  ) {
    const item = new MembershipInvitation();

    Object.assign(item, payload);

    return item;
  }
}

export const membershipInvitationAlias = 'membership-invitation';

export const condominiumAlias = 'condominium';

export type MembershipInvitationSelectKey =
  | `${typeof membershipInvitationAlias}.${keyof MembershipInvitation}`
  | `${typeof condominiumAlias}.${keyof Condominium}`;

export const membership_base_fields = [
  'membership-invitation.id',
  'membership-invitation.created_at',
  'membership-invitation.updated_at',
  'membership-invitation.user_id',
  'membership-invitation.membership_invitation_status',
  'condominium.id',
  'condominium.manager_id',
  'condominium.max_tenants_amount',
  'condominium.total_member_count',
] satisfies MembershipInvitationSelectKey[];
