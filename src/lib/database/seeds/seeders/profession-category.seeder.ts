/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSource } from 'typeorm';
import { type Seeder, SeederFactoryManager } from 'typeorm-extension';

import { ProfessionCategory } from 'src/modules/condominium-member/entities/profession-category.entity';

export const professionsCategoriesToCreate = [
  'Elétrico',
  'Encanamento',
  'Suporte',
  'TI',
  'Manutenção',
  'Jardinagem',
  'Limpeza',
  'Segurança',
  'Administração',
  'Construção',
  'Portaria',
  'Piscineiro',
  'Reparos Gerais',
  'Paisagismo',
  'Climatização',
  'Pintura',
  'Marcenaria',
] as const;

export type ProfessionCategoryType =
  (typeof professionsCategoriesToCreate)[number];

export default class ProfessionCategorySeeder implements Seeder {
  track = false;

  async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const profeProfessionCategoryRepository =
      dataSource.getRepository(ProfessionCategory);

    const newProfessionsCategories = professionsCategoriesToCreate.map(
      (profession) =>
        profeProfessionCategoryRepository.create({ category_name: profession }),
    );

    await Promise.all(
      newProfessionsCategories.map((cat) =>
        profeProfessionCategoryRepository.save(cat),
      ),
    );
  }
}
