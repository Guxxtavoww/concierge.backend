import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

import { baseColumnsWithIncrementalId } from '../entities/base-columns';

export class ScheduleCronJobs1727098617611 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'schedule-cron-jobs',
        columns: [
          ...baseColumnsWithIncrementalId,
          {
            name: 'cron_expression_start',
            type: 'varchar',
          },
          {
            name: 'cron_expression_end',
            type: 'varchar',
          },
          {
            name: 'schedule_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'schedule-cron-jobs',
      new TableIndex({
        name: 'IDX_CRON_EXPRESSION_START',
        columnNames: ['cron_expression_start'],
      }),
    );

    await queryRunner.createIndex(
      'schedule-cron-jobs',
      new TableIndex({
        name: 'IDX_CRON_EXPRESSION_END',
        columnNames: ['cron_expression_end'],
      }),
    );

    await queryRunner.createIndex(
      'schedule-cron-jobs',
      new TableIndex({
        name: 'IDX_UNIQUE_SCHEDULE_ID',
        columnNames: ['schedule_id'],
      }),
    );

    // Chave estrangeira
    await queryRunner.createForeignKey(
      'schedule-cron-jobs',
      new TableForeignKey({
        columnNames: ['schedule_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'schedules',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = (await queryRunner.getTable('schedule-cron-jobs')) as Table;
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('schedule_id') !== -1,
    ) as TableForeignKey;
    await queryRunner.dropForeignKey('schedule-cron-jobs', foreignKey);

    await queryRunner.dropIndex(
      'schedule-cron-jobs',
      'IDX_CRON_EXPRESSION_START',
    );
    await queryRunner.dropIndex(
      'schedule-cron-jobs',
      'IDX_CRON_EXPRESSION_END',
    );
    await queryRunner.dropIndex('schedule-cron-jobs', 'IDX_UNIQUE_SCHEDULE_ID');

    await queryRunner.dropTable('schedule-cron-jobs');
  }
}
