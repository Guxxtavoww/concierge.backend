import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Schedule } from 'src/modules/schedule/entities/schedule.entity';
import { ScheduleInvite } from 'src/modules/schedule/entities/schedule-invite.entity';
import { CondominiumMember } from 'src/modules/condominium-member/entities/condominium-member.entity';
import { MembershipInvitation } from 'src/modules/condominium-member/entities/membership-invitation.entity';

import type { CreateCondominiumType } from '../dtos/create-condominium.dto';
import type { UpdateCondominiumType } from '../dtos/update-condominium.dto';

/**
 * Represents a condominium entity.
 *
 * @extends Base
 */
@Entity('condominiums')
export class Condominium extends Base {
  /**
   * The name of the condominium.
   */
  @Index()
  @Column('varchar', { unique: true })
  condominium_name: string;

  /**
   * A brief description of the condominium.
   * This field is optional.
   */
  @Column('varchar', { nullable: true })
  description: NullableValue<string>;

  /**
   * The address of the condominium.
   */
  @Index()
  @Column('varchar')
  address: string;

  /**
   * The city where the condominium is located.
   */
  @Index()
  @Column('varchar')
  city: string;

  /**
   * The state where the condominium is located.
   */
  @Index()
  @Column('varchar')
  state: string;

  /**
   * The number of parking spots available in the condominium.
   * This field is optional.
   */
  @Column('int', { nullable: true })
  parking_spots: NullableValue<number>;

  /**
   * The monthly fee associated with the condominium.
   * This field is optional and supports decimal values.
   */
  @Column('decimal', { nullable: true, precision: 10, scale: 2 })
  monthly_fee: NullableValue<number>;

  /**
   * Indicates whether the condominium has a grill area.
   */
  @Column('boolean')
  has_grill: boolean;

  /**
   * Indicates whether the condominium has a swimming pool.
   */
  @Column('boolean')
  has_pool: boolean;

  /**
   * Indicates whether the condominium has a park.
   */
  @Column('boolean')
  has_park: boolean;

  /**
   * Indicates whether the condominium has security services.
   */
  @Column('boolean')
  has_security: boolean;

  /**
   * Indicates whether the condominium has gym services.
   */
  @Column('boolean')
  has_gym: boolean;

  /**
   * Indicates whether the condominium has gym services.
   */
  @Column('boolean')
  has_garden: boolean;

  /**
   * The maximum number of tenants allowed in the condominium.
   */
  @Column('int')
  max_tenants_amount: number;

  /**
   * The total number of units in the condominium.
   * This field is optional.
   */
  @Column('int', { nullable: true })
  total_units: NullableValue<number>;

  /**
   * The year the condominium was built.
   * This field is optional.
   */
  @Column('int', { nullable: true })
  year_built: NullableValue<number>;

  @Column('int', { default: 0 })
  total_member_count: number;

  /**
   * The UUID of the manager responsible for the condominium.
   */
  @Index()
  @Column('uuid')
  manager_id: string;

  /**
   * The user entity associated with the manager of the condominium.
   */
  @OneToMany(() => User, (user) => user.condominiums)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @OneToMany(() => CondominiumMember, (member) => member.condominium)
  members: CondominiumMember[];

  @OneToMany(
    () => MembershipInvitation,
    (membershipInvitation) => membershipInvitation.condominium,
  )
  membership_invites: MembershipInvitation[];

  @OneToMany(() => Schedule, (schedule) => schedule.condominium)
  schedules: Schedule[];

  @OneToMany(
    () => ScheduleInvite,
    (scheduleInvite) => scheduleInvite.condominium,
  )
  schedules_invites: ScheduleInvite[];

  static create(payload: CreateCondominiumType & { manager_id: string }) {
    const item = new Condominium();

    Object.assign(item, payload);

    return item;
  }

  static update(payload: UpdateCondominiumType) {
    const item = new Condominium();

    Object.assign(item, payload);

    return item;
  }
}

/**
 * The alias used for referencing the condominium entity in queries.
 */
export const alias = 'condominium';

export type CondominiumSelectKey = `${typeof alias}.${keyof Condominium}`;

/**
 * The base fields that can be selected from the condominium entity.
 */
export const base_fields: CondominiumSelectKey[] = [
  'condominium.id',
  'condominium.description',
  'condominium.manager_id',
  'condominium.condominium_name',
  'condominium.city',
  'condominium.state',
  'condominium.address',
  'condominium.max_tenants_amount',
  'condominium.has_security',
  'condominium.has_gym',
  'condominium.has_park',
  'condominium.has_pool',
  'condominium.has_grill',
  'condominium.monthly_fee',
  'condominium.total_units',
  'condominium.year_built',
  'condominium.total_member_count',
];
