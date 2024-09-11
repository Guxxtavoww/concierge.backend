/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSource } from 'typeorm';
import { type Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Profession } from 'src/modules/condominium-member/entities/profession.entity';
import { ProfessionCategory } from 'src/modules/condominium-member/entities/profession-category.entity';

import type { ProfessionCategoryType } from './profession-category.seeder';

export const professionsToCreate = [
  { name: 'Eletricista', category: 'Elétrico' },
  { name: 'Técnico em Eletricidade', category: 'Elétrico' },
  { name: 'Encanador', category: 'Encanamento' },
  { name: 'Técnico em Encanamento', category: 'Encanamento' },
  { name: 'Técnico de Suporte', category: 'Suporte' },
  { name: 'Assistente de Suporte', category: 'Suporte' },
  { name: 'Técnico de Informática', category: 'TI' },
  { name: 'Analista de TI', category: 'TI' },
  { name: 'Suporte de TI', category: 'TI' },
  { name: 'Técnico de Manutenção', category: 'Manutenção' },
  { name: 'Supervisor de Manutenção', category: 'Manutenção' },
  { name: 'Jardineiro', category: 'Jardinagem' },
  { name: 'Técnico em Jardinagem', category: 'Jardinagem' },
  { name: 'Auxiliar de Limpeza', category: 'Limpeza' },
  { name: 'Supervisor de Limpeza', category: 'Limpeza' },
  { name: 'Vigilante', category: 'Segurança' },
  { name: 'Segurança', category: 'Segurança' },
  { name: 'Assistente Administrativo', category: 'Administração' },
  { name: 'Administrador', category: 'Administração' },
  { name: 'Pedreiro', category: 'Construção' },
  { name: 'Mestre de Obras', category: 'Construção' },
  { name: 'Porteiro', category: 'Portaria' },
  { name: 'Supervisor de Portaria', category: 'Portaria' },
  { name: 'Piscineiro', category: 'Piscineiro' },
  { name: 'Técnico em Reparos Gerais', category: 'Reparos Gerais' },
  { name: 'Auxiliar de Reparos', category: 'Reparos Gerais' },
  { name: 'Paisagista', category: 'Paisagismo' },
  { name: 'Técnico em Climatização', category: 'Climatização' },
  { name: 'Instalador de Ar Condicionado', category: 'Climatização' },
  { name: 'Pintor', category: 'Pintura' },
  { name: 'Marceneiro', category: 'Marcenaria' },
] satisfies { name: string; category: ProfessionCategoryType }[];

export default class ProfessionSeeder implements Seeder {
  track = false;

  async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const professionRepository = dataSource.getRepository(Profession);
    const professionCategoryRepository =
      dataSource.getRepository(ProfessionCategory);

    // Buscar todas as categorias do banco de dados
    const categories = await professionCategoryRepository.find();

    // Criar mapa de categorias para fácil acesso
    const categoryMap = categories.reduce(
      (acc, category) => {
        acc[category.category_name] = category;
        return acc;
      },
      {} as Record<string, ProfessionCategory>,
    );

    const newProfessions = professionsToCreate.map((profession) => {
      const professionCategoryId = categoryMap[profession.category]!.id;

      // Criar uma nova profissão associada à sua categoria
      return professionRepository.create({
        name: profession.name,
        profession_category_id: professionCategoryId,
      });
    });

    // Salvar todas as novas profissões no banco de dados
    await Promise.all(
      newProfessions.map((profession) => professionRepository.save(profession)),
    );
  }
}
