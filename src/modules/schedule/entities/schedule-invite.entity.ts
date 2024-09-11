import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';
import { CondominiumMember } from 'src/modules/condominium-member/entities/condominium-member.entity';

import { Schedule } from './schedule.entity';
import { ScheduleInviteStatus } from '../enums/schedule-invite-status.enum';

@Entity('schedule-invites')
export class ScheduleInvite extends Base {
  @Index()
  @Column('uuid')
  schedule_id: string;

  @Index()
  @Column('uuid')
  condominium_member_id: string;

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
}
