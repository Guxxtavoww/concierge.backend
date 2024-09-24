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
        referencedTableName: 'condominium-members',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'condominium-chat-members',
        columns: [
          {
            name: 'chat_id',
            type: 'uuid',
          },
          {
            name: 'member_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'condominium-chat-members',
      new TableForeignKey({
        columnNames: ['chat_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominium-chats',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'condominium-chat-members',
      new TableForeignKey({
        columnNames: ['member_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominium-members',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'condominium-chat-members',
      new TableIndex({
        name: 'IDX_CHAT_MEMBER_CHAT_ID',
        columnNames: ['chat_id'],
      }),
    );

    await queryRunner.createIndex(
      'condominium-chat-members',
      new TableIndex({
        name: 'IDX_CHAT_MEMBER_MEMBER_ID',
        columnNames: ['member_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const chatMembersTable = await queryRunner.getTable(
      'condominium_chat_members',
    );

    const chatForeignKey = chatMembersTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('chat_id') !== -1,
    ) as TableForeignKey;
    const memberForeignKey = chatMembersTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('member_id') !== -1,
    ) as TableForeignKey;

    await queryRunner.dropForeignKey(
      'condominium_chat_members',
      chatForeignKey,
    );
    await queryRunner.dropForeignKey(
      'condominium_chat_members',
      memberForeignKey,
    );
    await queryRunner.dropIndex(
      'condominium_chat_members',
      'IDX_CHAT_MEMBER_CHAT_ID',
    );
    await queryRunner.dropIndex(
      'condominium_chat_members',
      'IDX_CHAT_MEMBER_MEMBER_ID',
    );
    await queryRunner.dropTable('condominium_chat_members');

    const table = (await queryRunner.getTable('condominium-chats')) as Table;

    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('admin_id') !== -1,
    ) as TableForeignKey;

    await queryRunner.dropForeignKey('condominium-chats', foreignKey);
    await queryRunner.dropIndex(
      'condominium-chats',
      'IDX_CONDOMINIUM_CHAT_TITLE',
    );
    await queryRunner.dropIndex(
      'condominium-chats',
      'IDX_CONDOMINIUM_CHAT_ADMIN_ID',
    );
    await queryRunner.dropTable('condominium-chats');
  }
}
