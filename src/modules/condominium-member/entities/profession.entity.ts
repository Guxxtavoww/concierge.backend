import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

import { BaseWithIncrementalId } from 'src/lib/database/entities/base.entity';

import { CondominiumMember } from './condominium-member.entity';
import { ProfessionCategory } from './profession-category.entity';
import type { CreateProfessionPayload } from '../dtos/profession/create-profession.dto';

@Entity('professions')
export class Profession extends BaseWithIncrementalId {
  @Index()
  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { nullable: true })
  description: NullableValue<string>;

  @Index()
  @Column('int')
  profession_category_id: number;

  @ManyToOne(() => ProfessionCategory, (category) => category.professions)
  @JoinColumn({ name: 'profession_category_id' })
  profession_category: ProfessionCategory;

  @ManyToMany(() => CondominiumMember, (member) => member.professions)
  members: CondominiumMember[];

  static create(payload: CreateProfessionPayload) {
    const item = new Profession();

    Object.assign(item, payload);

    return item;
  }
}

export const professionAlias = 'profession';

export type ProfessionSelectKey =
  `${typeof professionAlias}.${keyof Profession}`;

export const base_profession_fields = [
  'profession.id',
  'profession.name',
  'profession.description',
  'profession.profession_category_id',
] satisfies ProfessionSelectKey[];
