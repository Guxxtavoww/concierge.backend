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

import { Base } from 'src/lib/database/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Condominium } from 'src/modules/condominium/entities/condominium.entity';
import { CondominiumMember } from 'src/modules/condominium-member/entities/condominium-member.entity';

import { ScheduleInvite } from './schedule-invite.entity';
import { ScheduleType } from '../enums/schedule-type.enum';
import { ScheduleStatus } from '../enums/schedule-status.enum';

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
  created_by_user_id: string;

  @ManyToOne(() => User, (user) => user.schedules)
  @JoinColumn({ name: 'created_by_user_id' })
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
}
