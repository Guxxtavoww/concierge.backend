import {
  Table,
  QueryRunner,
  TableIndex,
  TableForeignKey,
  type MigrationInterface,
} from 'typeorm';

import {
  ScheduleInviteStatus,
  schedule_invite_status,
} from 'src/modules/schedule/enums/schedule-invite-status.enum';

import { baseColumns } from '../entities/base-columns';

export class ScheduleInvites1726093393265 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'schedule-invites',
        columns: [
          ...baseColumns,
          {
            name: 'schedule_id',
            type: 'uuid',
          },
          {
            name: 'condominium_member_id',
            type: 'uuid',
          },
          {
            name: 'schedule_invite_status',
            type: 'enum',
            enum: schedule_invite_status,
            default: `'${ScheduleInviteStatus.PENDING}'`,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'schedule-invites',
      new TableIndex({
        name: 'IDX_SCHEDULE_ID',
        columnNames: ['schedule_id'],
      }),
    );

    await queryRunner.createIndex(
      'schedule-invites',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_MEMBER_ID',
        columnNames: ['condominium_member_id'],
      }),
    );

    await queryRunner.createIndex(
      'schedule-invites',
      new TableIndex({
        name: 'IDX_SCHEDULE_INVITE_STATUS',
        columnNames: ['schedule_invite_status'],
      }),
    );

    // Add foreign key for 'schedule_id'
    await queryRunner.createForeignKey(
      'schedule-invites',
      new TableForeignKey({
        columnNames: ['schedule_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'schedules',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key for 'condominium_member_id'
    await queryRunner.createForeignKey(
      'schedule-invites',
      new TableForeignKey({
        columnNames: ['condominium_member_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominiums-members',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'schedule-invites',
      'FK_schedule_invites_schedule',
    );
    await queryRunner.dropForeignKey(
      'schedule-invites',
      'FK_schedule_invites_condominium_member',
    );

    await queryRunner.dropIndex('schedule-invites', 'IDX_SCHEDULE_ID');
    await queryRunner.dropIndex(
      'schedule-invites',
      'IDX_CONDOMINIUM_MEMBER_ID',
    );
    await queryRunner.dropIndex(
      'schedule-invites',
      'IDX_SCHEDULE_INVITE_STATUS',
    );

    await queryRunner.dropTable('schedule-invites');
  }
}
