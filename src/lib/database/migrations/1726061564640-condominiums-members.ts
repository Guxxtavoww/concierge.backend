import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

import { baseColumns } from '../entities/base-columns';

export class CondominiumsMembers1726061564640 implements MigrationInterface {
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

    await queryRunner.createTable(
      new Table({
        name: 'condominium_member_professions',
        columns: [
          {
            name: 'condominium_member_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'profession_id',
            type: 'int',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'condominium_member_professions',
      new TableForeignKey({
        columnNames: ['condominium_member_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominiums-members',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'condominium_member_professions',
      new TableForeignKey({
        columnNames: ['profession_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'professions',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'condominium_member_professions',
      new TableIndex({
        name: 'IDX_PROFESSION_ID',
        columnNames: ['profession_id'],
      }),
    );

    await queryRunner.createIndex(
      'condominium_member_professions',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_MEMBER_ID',
        columnNames: ['condominium_member_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableProfessions = await queryRunner.getTable(
      'condominium_member_professions',
    );

    if (tableProfessions) {
      const foreignKeysProfessions = tableProfessions.foreignKeys;

      for (const fk of foreignKeysProfessions) {
        await queryRunner.dropForeignKey('condominium_member_professions', fk);
      }

      await queryRunner.dropIndex(
        'condominium_member_professions',
        'IDX_PROFESSION_ID',
      );
      await queryRunner.dropIndex(
        'condominium_member_professions',
        'IDX_CONDOMINIUM_MEMBER_ID',
      );

      await queryRunner.dropTable('condominium_member_professions');
    }

    // Remover foreign keys e tabela 'condominiums-members'
    const tableMembers = await queryRunner.getTable('condominiums-members');

    if (tableMembers) {
      const foreignKeysMembers = tableMembers.foreignKeys;
      for (const fk of foreignKeysMembers) {
        await queryRunner.dropForeignKey('condominiums-members', fk);
      }

      await queryRunner.dropIndex('condominiums-members', 'IDX_CONDOMINIUM_ID');
      await queryRunner.dropIndex('condominiums-members', 'IDX_USER_ID');

      await queryRunner.dropTable('condominiums-members');
    }
  }
}
