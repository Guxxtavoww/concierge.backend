import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { User } from 'src/modules/user/entities/user.entity';
import { Base } from 'src/lib/database/entities/base.entity';
import { Condominium } from 'src/modules/condominium/entities/condominium.entity';
import { CondominiumMember } from 'src/modules/condominium-member/entities/condominium-member.entity';

import { ScheduleInvite } from './schedule-invite.entity';
import { ScheduleType } from '../enums/schedule-type.enum';
import { ScheduleStatus } from '../enums/schedule-status.enum';
import type { CreateSchedule } from '../dtos/create-schedule.dto';
import type { UpdateSchedulePayload } from '../dtos/update-schedule.dto';

@Entity('schedules')
export class Schedule extends Base {
  @Index()
  @Column('varchar')
  schedule_title: string;

  @Index()
  @Column('varchar', { nullable: true })
  schedule_description: NullableValue<string>;

  @Index()
  @Column('enum', { enum: ScheduleStatus, default: ScheduleStatus.SCHEDULED })
  schedule_status: ScheduleStatus;

  @Index()
  @Column('enum', { enum: ScheduleType })
  schedule_type: ScheduleType;

  @Index()
  @Column('timestamp')
  scheduled_datetime: string;

  @Column('boolean')
  is_private: boolean;

  @Column('int', { nullable: true })
  participant_limit: NullableValue<number>;

  @Index()
  @Column('uuid')
  condominium_id: string;

  @Index()
  @Column('uuid')
  created_by_id: string;

  @ManyToOne(() => User, (member) => member.created_schedules)
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @ManyToOne(() => Condominium, (condominium) => condominium.schedules)
  @JoinColumn({ name: 'condominium_id' })
  condominium: Condominium;

  @OneToMany(() => ScheduleInvite, (invite) => invite.schedule)
  invites: ScheduleInvite[];

  @ManyToMany(() => CondominiumMember, (member) => member.events)
  @JoinTable({
    name: 'schedule-participants',
    joinColumn: { name: 'schedule_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'condominium_member_id',
      referencedColumnName: 'id',
    },
  })
  participants: CondominiumMember[];

  static create(payload: CreateSchedule) {
    const item = new Schedule();

    Object.assign(item, payload);

    return item;
  }

  static update(payload: UpdateSchedulePayload) {
    const item = new Schedule();

    Object.assign(item, payload);

    return item;
  }
}

export const scheduleAlias = 'schedule';
export const createdByAlias = 'created_by';

export type ScheduleSelectKey =
  | `${typeof scheduleAlias}.${keyof Omit<Schedule, 'create' | 'update'>}`
  | `${typeof createdByAlias}.${keyof User}`;

export const schedule_base_fields: ScheduleSelectKey[] = [
  'schedule.id',
  'schedule.schedule_description',
  'schedule.schedule_title',
  'schedule.is_private',
  'schedule.participant_limit',
  'schedule.schedule_status',
  'schedule.scheduled_datetime',
  'schedule.schedule_type',
  'schedule.created_at',
  'schedule.updated_at',
  'schedule.condominium_id',
  'created_by.id',
  'created_by.user_name',
  'created_by.created_at',
];
