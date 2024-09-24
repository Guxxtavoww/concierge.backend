import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Schedule } from 'src/modules/schedule/entities/schedule.entity';
import { Condominium } from 'src/modules/condominium/entities/condominium.entity';
import { ScheduleInvite } from 'src/modules/schedule/entities/schedule-invite.entity';
import { CondominiumChat } from 'src/modules/condominium-chat/entities/condominium-chat.entity';
import { CondominiumChatMessage } from 'src/modules/condominium-chat/entities/condominium-chat-message.entity';

import { Profession } from './profession.entity';
import type { CreateCondominiumMemberPayload } from '../dtos/condominium-member/create-condominium-member.dto';

@Entity('condominium-members')
export class CondominiumMember extends Base {
  @Index()
  @Column('uuid')
  condominium_id: string;

  @Index()
  @Column('uuid')
  user_id: string;

  @Column('boolean', { default: false })
  is_tenant: boolean;

  @ManyToOne(() => User, (u) => u.memberships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Condominium, (c) => c.members)
  @JoinColumn({ name: 'condominium_id' })
  condominium: Condominium;

  @ManyToMany(() => Profession, (profession) => profession.members)
  @JoinTable({
    name: 'condominium-member-professions', // Nome da tabela intermediária
    joinColumn: { name: 'condominium_member_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'profession_id', referencedColumnName: 'id' },
  })
  professions: Profession[];

  @OneToMany(() => ScheduleInvite, (invite) => invite.member)
  invites: ScheduleInvite[];

  @OneToMany(() => CondominiumChat, (chat) => chat.admin)
  administrated_chats: CondominiumChat[];

  @OneToMany(() => CondominiumChatMessage, (message) => message.sended_by)
  sended_messages: CondominiumChatMessage[];

  @ManyToMany(() => Schedule, (schedule) => schedule.participants)
  events: Schedule[];

  static create(
    payload: CreateCondominiumMemberPayload & {
      condominium_id: string;
    },
  ) {
    const item = new CondominiumMember();

    Object.assign(item, payload);

    return item;
  }
}

export const userAlias = 'user';
export const eventsAlias = 'events';
export const condominiumMemberAlias = 'condominium-member';

export type CondominiumMemberSelectKey =
  | `${typeof condominiumMemberAlias}.${keyof CondominiumMember}`
  | `${typeof userAlias}.${keyof User}`;

export const base_fields = [
  'condominium-member.id',
  'condominium-member.is_tenant',
  'condominium-member.user_id',
  'condominium-member.condominium_id',
  'condominium-member.updated_at',
  'condominium-member.created_at',
] satisfies CondominiumMemberSelectKey[];

export const perfomatic_fields = [
  'condominium-member.user_id',
  'condominium-member.condominium_id',
] satisfies CondominiumMemberSelectKey[];

export const base_fields_with_events = [
  'condominium-member.id',
  'condominium-member.is_tenant',
  'user.user_name',
  'user.user_email',
];
