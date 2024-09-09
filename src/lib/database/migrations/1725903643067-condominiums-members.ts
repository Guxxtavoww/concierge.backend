import {
  Table,
  TableIndex,
  TableForeignKey,
  type QueryRunner,
  type MigrationInterface,
} from 'typeorm';

import { baseColumns } from '../entities/base-columns';

export class CondominiumsMembers1725903643067 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'condominiums-members',
        columns: [
          ...baseColumns,
          {
            name: 'condominium_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'is_tenant',
            type: 'boolean',
            default: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'condominiums-members',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_ID',
        columnNames: ['condominium_id'],
      }),
    );

    await queryRunner.createIndex(
      'condominiums-members',
      new TableIndex({
        name: 'IDX_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'condominiums-members',
      new TableIndex({
        name: 'IDX_IS_TENANT',
        columnNames: ['is_tenant'],
      }),
    );

    await queryRunner.createForeignKey(
      'condominiums-members',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'condominiums-members',
      new TableForeignKey({
        columnNames: ['condominium_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominiums',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('condominiums-members');

    if (table) {
      const foreignKeys = table.foreignKeys.filter(
        (fk) =>
          fk.columnNames.includes('user_id') ||
          fk.columnNames.includes('condominium_id'),
      );

      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('condominiums-members', fk);
      }

      await queryRunner.dropIndex('condominiums-members', 'IDX_CONDOMINIUM_ID');
      await queryRunner.dropIndex('condominiums-members', 'IDX_USER_ID');
      await queryRunner.dropIndex('condominiums-members', 'IDX_IS_TENANT');

      await queryRunner.dropTable('condominiums-members');
    }
  }
}
