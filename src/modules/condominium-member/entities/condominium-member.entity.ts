import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Condominium } from 'src/modules/condominium/entities/condominium.entity';

import { Profession } from './profession.entity';
import type { CreateCondominiumMemberPayload } from '../dtos/condominium/create-condominium-member.dto';

@Entity('condominiums-members')
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
    name: 'condominium_member_professions', // Nome da tabela intermediária
    joinColumn: { name: 'condominium_member_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'profession_id', referencedColumnName: 'id' },
  })
  professions: Profession[];

  static create(payload: CreateCondominiumMemberPayload & { user_id: string }) {
    const item = new CondominiumMember();

    Object.assign(item, payload);

    return item;
  }
}

export const alias = 'condominium-member';

export type CondominiumMemberSelectKey =
  `${typeof alias}.${keyof CondominiumMember}`;

export const base_fields: CondominiumMemberSelectKey[] = [
  'condominium-member.id',
  'condominium-member.is_tenant',
  'condominium-member.user_id',
  'condominium-member.condominium_id',
  'condominium-member.updated_at',
  'condominium-member.created_at',
];

export const perfomatic_fields: CondominiumMemberSelectKey[] = [
  'condominium-member.user_id',
  'condominium-member.condominium_id',
];
