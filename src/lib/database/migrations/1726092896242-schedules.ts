import {
  Table,
  QueryRunner,
  TableIndex,
  TableForeignKey,
  type MigrationInterface,
} from 'typeorm';

import {
  schedule_status,
  ScheduleStatus,
} from 'src/modules/schedule/enums/schedule-status.enum';
import { schedule_types } from 'src/modules/schedule/enums/schedule-type.enum';

import { baseColumns } from '../entities/base-columns';

export class Schedules1726092896242 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'schedules',
        columns: [
          ...baseColumns,
          {
            name: 'schedule_title',
            type: 'varchar',
          },
          {
            name: 'schedule_description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'schedule_status',
            type: 'enum',
            enum: schedule_status,
            default: `'${ScheduleStatus.SCHEDULED}'`,
          },
          {
            name: 'schedule_type',
            type: 'enum',
            enum: schedule_types,
          },
          {
            name: 'scheduled_datetime_start',
            type: 'timestamp',
          },
          {
            name: 'scheduled_datetime_end',
            type: 'timestamp',
          },
          {
            name: 'is_private',
            type: 'boolean',
          },
          {
            name: 'participant_limit',
            type: 'int',
            isNullable: true,
            default: null,
          },
          {
            name: 'confirmed_participants_amount',
            type: 'int',
            default: 0,
          },
          {
            name: 'condominium_id',
            type: 'uuid',
          },
          {
            name: 'created_by_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'schedules',
      new TableIndex({
        name: 'IDX_SCHEDULE_TITLE',
        columnNames: ['schedule_title'],
      }),
    );

    await queryRunner.createIndex(
      'schedules',
      new TableIndex({
        name: 'IDX_SCHEDULE_DESCRIPTION',
        columnNames: ['schedule_description'],
      }),
    );

    await queryRunner.createIndex(
      'schedules',
      new TableIndex({
        name: 'IDX_SCHEDULE_STATUS',
        columnNames: ['schedule_status'],
      }),
    );

    await queryRunner.createIndex(
      'schedules',
      new TableIndex({
        name: 'IDX_SCHEDULE_TYPE',
        columnNames: ['schedule_type'],
      }),
    );

    await queryRunner.createIndex(
      'schedules',
      new TableIndex({
        name: 'IDX_SCHEDULED_DATETIME_START',
        columnNames: ['scheduled_datetime_start'],
      }),
    );

    await queryRunner.createIndex(
      'schedules',
      new TableIndex({
        name: 'IDX_SCHEDULED_DATETIME_END',
        columnNames: ['scheduled_datetime_end'],
      }),
    );

    await queryRunner.createIndex(
      'schedules',
      new TableIndex({
        name: 'IDX_SCHEDULE_CONDOMINIUM_ID',
        columnNames: ['condominium_id'],
      }),
    );

    await queryRunner.createIndex(
      'schedules',
      new TableIndex({
        name: 'IDX_CREATED_BY_ID',
        columnNames: ['created_by_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'schedules',
      new TableForeignKey({
        columnNames: ['condominium_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominiums',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'schedules',
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'schedule-participants',
        columns: [
          {
            name: 'schedule_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'condominium_member_id',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'schedule-participants',
      new TableIndex({
        name: 'IDX_SCHEDULE_ID',
        columnNames: ['schedule_id'],
      }),
    );

    await queryRunner.createIndex(
      'schedule-participants',
      new TableIndex({
        name: 'IDX_SCHEDULE_CONDOMINIUM_MEMBER_ID',
        columnNames: ['condominium_member_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'schedule-participants',
      new TableForeignKey({
        columnNames: ['schedule_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'schedules',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'schedule-participants',
      new TableForeignKey({
        columnNames: ['condominium_member_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominium-members',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'schedule-participants',
      'FK_schedule_participants_schedule',
    );
    await queryRunner.dropForeignKey(
      'schedule-participants',
      'FK_schedule_participants_member',
    );

    await queryRunner.dropForeignKey('schedules', 'FK_schedules_condominium');
    await queryRunner.dropForeignKey('schedules', 'FK_schedules_user');

    await queryRunner.dropIndex('schedules', 'IDX_SCHEDULE_TITLE');
    await queryRunner.dropIndex('schedules', 'IDX_SCHEDULE_DESCRIPTION');
    await queryRunner.dropIndex('schedules', 'IDX_SCHEDULE_STATUS');
    await queryRunner.dropIndex('schedules', 'IDX_SCHEDULE_TYPE');
    await queryRunner.dropIndex('schedules', 'IDX_SCHEDULED_DATETIME_START');
    await queryRunner.dropIndex('schedules', 'IDX_SCHEDULED_DATETIME_END');
    await queryRunner.dropIndex('schedules', 'IDX_SCHEDULE_CONDOMINIUM_ID');
    await queryRunner.dropIndex('schedules', 'IDX_CREATED_BY_ID');

    await queryRunner.dropIndex('schedule-participants', 'IDX_SCHEDULE_ID');
    await queryRunner.dropIndex(
      'schedule-participants',
      'IDX_SCHEDULE_CONDOMINIUM_MEMBER_ID',
    );

    await queryRunner.dropTable('schedule-participants');
    await queryRunner.dropTable('schedules');
  }
}
