import {
  Table,
  TableIndex,
  type QueryRunner,
  type MigrationInterface,
} from 'typeorm';

import { baseColumnsWithIncrementalId } from '../entities/base-columns';

export class ProfessionCategory1725903643068 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'professions-categories',
        columns: [
          ...baseColumnsWithIncrementalId,
          {
            name: 'category_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'category_description',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'professions-categories',
      new TableIndex({
        name: 'IDX_PROFESSION_CATEGORY_NAME',
        columnNames: ['category_name'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'professions-categories',
      'IDX_PROFESSION_CATEGORY_NAME',
    );

    await queryRunner.dropTable('professions-categories');
  }
}
