import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

import { baseColumns } from '../entities/base-columns';

export class CondominiumChats1727208447985 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'condominium-chats',
        columns: [
          ...baseColumns,
          {
            name: 'chat_title',
            type: 'varchar',
          },
          {
            name: 'chat_description',
            type: 'varchar',
          },
          {
            name: 'messages_amount',
            type: 'int',
            default: 0,
          },
          {
            name: 'admin_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'condominium-chats',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_CHAT_TITLE',
        columnNames: ['chat_title'],
      }),
    );

    await queryRunner.createIndex(
      'condominium-chats',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_CHAT_ADMIN_ID',
        columnNames: ['admin_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'condominium-chats',
      new TableForeignKey({
        columnNames: ['admin_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominium_members',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = (await queryRunner.getTable('condominium-chats')) as Table;
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('admin_id') !== -1,
    ) as TableForeignKey;

    await queryRunner.dropForeignKey('condominium-chats', foreignKey);

    // Drop the indexes
    await queryRunner.dropIndex(
      'condominium-chats',
      'IDX_CONDOMINIUM_CHAT_TITLE',
    );
    await queryRunner.dropIndex(
      'condominium-chats',
      'IDX_CONDOMINIUM_CHAT_ADMIN_ID',
    );

    // Drop the 'condominium-chats' table
    await queryRunner.dropTable('condominium-chats');
  }
}
