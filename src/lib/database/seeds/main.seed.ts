/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataSource } from 'typeorm';
import {
  type Seeder,
  SeederFactoryManager,
  runSeeder,
} from 'typeorm-extension';

import {
  UserSeeder,
  ProfessionCategorySeeder,
  ProfessionSeeder,
} from './seeders';

export class MainSeeder implements Seeder {
  track?: boolean | undefined = true;

  async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<void> {
    await Promise.all([
      runSeeder(dataSource, UserSeeder),
      runSeeder(dataSource, ProfessionCategorySeeder),
    ]);

    await runSeeder(dataSource, ProfessionSeeder);
  }
}
