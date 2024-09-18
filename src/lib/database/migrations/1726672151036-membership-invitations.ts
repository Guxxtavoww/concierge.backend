import {
  Table,
  TableIndex,
  QueryRunner,
  TableForeignKey,
  type MigrationInterface,
} from 'typeorm';

import {
  MembershipInvitationStatus,
  membership_invitaion_statuses,
} from 'src/modules/condominium-member/enums/membership-invitation-status.enum';

import { baseColumns } from '../entities/base-columns';

export class MembershipInvitations1726672151036 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'membership-invitations',
        columns: [
          ...baseColumns,
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'condominium_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'is_tenant',
            type: 'boolean',
            default: false,
          },
          {
            name: 'membership_invitation_status',
            type: 'enum',
            enum: membership_invitaion_statuses,
            default: `'${MembershipInvitationStatus.SENT}'`,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'membership-invitations',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'membership-invitations',
      new TableForeignKey({
        columnNames: ['condominium_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'condominiums',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'membership-invitations',
      new TableIndex({
        name: 'IDX_MEMBERSHIP_INVITATIONS_USER_ID',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'membership-invitations',
      new TableIndex({
        name: 'IDX_MEMBERSHIP_INVITATIONS_CONDOMINIUM_ID',
        columnNames: ['condominium_id'],
      }),
    );

    await queryRunner.createIndex(
      'membership-invitations',
      new TableIndex({
        name: 'IDX_MEMBERSHIP_INVITATIONS_STATUS',
        columnNames: ['membership_invitation_status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'membership-invitations',
      'IDX_MEMBERSHIP_INVITATIONS_USER_ID',
    );
    await queryRunner.dropIndex(
      'membership-invitations',
      'IDX_MEMBERSHIP_INVITATIONS_CONDOMINIUM_ID',
    );
    await queryRunner.dropIndex(
      'membership-invitations',
      'IDX_MEMBERSHIP_INVITATIONS_STATUS',
    );

    await queryRunner.dropForeignKey('membership-invitations', 'user_id');
    await queryRunner.dropForeignKey(
      'membership-invitations',
      'condominium_id',
    );

    await queryRunner.dropTable('membership-invitations');
  }
}
