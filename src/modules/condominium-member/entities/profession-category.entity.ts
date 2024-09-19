import { Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseWithIncrementalId } from 'src/lib/database/entities/base.entity';

import { Profession } from './profession.entity';
import type { CreateProfessionCategoryPayload } from '../dtos/profession-category/create-profession-category.dto';
import type { UpdateProfessionCategoryPayload } from '../dtos/profession-category/update-profession-category.dto';

@Entity('professions-categories')
export class ProfessionCategory extends BaseWithIncrementalId {
  @Index()
  @Column('varchar', { length: 255 })
  category_name: string;

  @Column('varchar', { nullable: true })
  category_description: NullableValue<string>;

  @OneToMany(() => Profession, (profession) => profession.profession_category)
  professions: Profession[];

  static create(payload: CreateProfessionCategoryPayload) {
    const item = new ProfessionCategory();

    Object.assign(item, payload);

    return item;
  }

  static update(payload: UpdateProfessionCategoryPayload) {
    const item = new ProfessionCategory();

    Object.assign(item, payload);

    return item;
  }
}

export const professionCategoryAlias = 'profession-category';

export type ProfessionCategorySelectKey =
  `${typeof professionCategoryAlias}.${keyof ProfessionCategory}`;

export const base_profession_category_fields = [
  'profession-category.id',
  'profession-category.category_name',
  'profession-category.category_description',
] satisfies ProfessionCategorySelectKey[];
