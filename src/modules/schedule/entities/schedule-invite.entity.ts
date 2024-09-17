import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';
import { Condominium } from 'src/modules/condominium/entities/condominium.entity';
import { CondominiumMember } from 'src/modules/condominium-member/entities/condominium-member.entity';

import { Schedule } from './schedule.entity';
import { ScheduleInviteStatus } from '../enums/schedule-invite-status.enum';
import type { SendScheduleInvitePayload } from '../dtos/send-schedule-invite.dto';

@Entity('schedule-invites')
export class ScheduleInvite extends Base {
  @Index()
  @Column('uuid')
  schedule_id: string;

  @Index()
  @Column('uuid')
  condominium_member_id: string;

  @Index()
  @Column('uuid')
  condominium_id: string;

  @Index()
  @Column('enum', {
    enum: ScheduleInviteStatus,
    default: ScheduleInviteStatus.PENDING,
  })
  schedule_invite_status: ScheduleInviteStatus;

  @ManyToOne(() => Schedule, (schedule) => schedule.invites)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @ManyToOne(() => CondominiumMember, (member) => member.invites)
  @JoinColumn({ name: 'condominium_member_id' })
  member: CondominiumMember;

  @ManyToOne(() => Condominium, (condominium) => condominium.invites)
  @JoinColumn({ name: 'condominium_id' })
  condominium: Condominium;

  static create(
    payload: SendScheduleInvitePayload & { condominium_member_id: string },
  ) {
    const item = new ScheduleInvite();

    Object.assign(item, payload);

    return item;
  }
}

export const scheduleInviteAlias = 'schedule-invite';
export const scheduleAlias = 'schedule';

export type ScheduleInviteSelectKey =
  | `${typeof scheduleInviteAlias}.${keyof ScheduleInvite}`
  | `${typeof scheduleAlias}.${keyof Schedule}`;

export const schedule_invite_base_fields: ScheduleInviteSelectKey[] = [
  'schedule-invite.id',
  'schedule-invite.condominium_member_id',
  'schedule-invite.schedule_invite_status',
  'schedule-invite.updated_at',
  'schedule-invite.created_at',
  'schedule-invite.condominium_id',
  'schedule.id',
  'schedule.schedule_status',
  'schedule.confirmed_participants_amount',
  'schedule.participant_limit',
];
