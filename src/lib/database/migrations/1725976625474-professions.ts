import {
  Table,
  TableIndex,
  TableForeignKey,
  type QueryRunner,
  type MigrationInterface,
} from 'typeorm';

import { baseColumnsWithIncrementalId } from '../entities/base-columns';

export class Profession1725903643069 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'professions',
        columns: [
          ...baseColumnsWithIncrementalId,
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'profession_category_id',
            type: 'int',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'professions',
      new TableIndex({
        name: 'IDX_PROFESSION_NAME',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'professions',
      new TableIndex({
        name: 'IDX_PROFESSION_CATEGORY_ID',
        columnNames: ['profession_category_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'professions',
      new TableForeignKey({
        columnNames: ['profession_category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'professions-categories',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('professions');

    if (table) {
      const foreignKeys = table.foreignKeys.filter((fk) =>
        fk.columnNames.includes('profession_category_id'),
      );

      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('professions', fk);
      }

      await queryRunner.dropIndex('professions', 'IDX_PROFESSION_NAME');
      await queryRunner.dropIndex('professions', 'IDX_PROFESSION_CATEGORY_ID');

      await queryRunner.dropTable('professions');
    }
  }
}
