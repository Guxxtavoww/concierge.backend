import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

import { maxLengthForMessageText } from 'src/modules/condominium-chat/entities/condominium-chat-message.entity';

import { baseColumns } from '../entities/base-columns';

export class CondominiumChatMessages1727208682675
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'condominium-chat-messages',
        columns: [
          ...baseColumns,
          {
            name: 'message_text',
            type: 'varchar',
            length: `${maxLengthForMessageText}`, // Max length for the message text
          },
          {
            name: 'condominium_chat_id',
            type: 'uuid',
          },
          {
            name: 'sended_by_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'condominium-chat-messages',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_CHAT_MESSAGE_TEXT',
        columnNames: ['message_text'],
      }),
    );

    await queryRunner.createIndex(
      'condominium-chat-messages',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_CHAT_MESSAGE_CHAT_ID',
        columnNames: ['condominium_chat_id'],
      }),
    );

    await queryRunner.createIndex(
      'condominium-chat-messages',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_CHAT_MESSAGE_SENDED_BY_ID',
        columnNames: ['sended_by_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'condominium-chat-messages',
      new TableForeignKey({
        columnNames: ['condominium_chat_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominium-chats',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'condominium-chat-messages',
      new TableForeignKey({
        columnNames: ['sended_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominium-members',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = (await queryRunner.getTable(
      'condominium-chat-messages',
    )) as Table;

    const chatForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('condominium_chat_id') !== -1,
    ) as TableForeignKey;
    await queryRunner.dropForeignKey(
      'condominium-chat-messages',
      chatForeignKey,
    );

    const senderForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('sended_by_id') !== -1,
    ) as TableForeignKey;
    await queryRunner.dropForeignKey(
      'condominium-chat-messages',
      senderForeignKey,
    );

    // Drop indexes
    await queryRunner.dropIndex(
      'condominium-chat-messages',
      'IDX_CONDOMINIUM_CHAT_MESSAGE_TEXT',
    );
    await queryRunner.dropIndex(
      'condominium-chat-messages',
      'IDX_CONDOMINIUM_CHAT_MESSAGE_CHAT_ID',
    );
    await queryRunner.dropIndex(
      'condominium-chat-messages',
      'IDX_CONDOMINIUM_CHAT_MESSAGE_SENDED_BY_ID',
    );

    // Drop the 'condominium-chat-messages' table
    await queryRunner.dropTable('condominium-chat-messages');
  }
}
