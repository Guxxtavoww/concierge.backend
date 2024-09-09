import {
  Table,
  TableIndex,
  QueryRunner,
  TableForeignKey,
  MigrationInterface,
} from 'typeorm';

import { baseColumns } from '../entities/base-columns';

export class Condominiums1725457562303 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'condominiums',
        columns: [
          ...baseColumns,
          {
            name: 'condominium_name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
          },
          {
            name: 'city',
            type: 'varchar',
          },
          {
            name: 'state',
            type: 'varchar',
          },
          {
            name: 'parking_spots',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'monthly_fee',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'has_grill',
            type: 'boolean',
          },
          {
            name: 'has_pool',
            type: 'boolean',
          },
          {
            name: 'has_park',
            type: 'boolean',
          },
          {
            name: 'has_security',
            type: 'boolean',
          },
          {
            name: 'has_gym',
            type: 'boolean',
          },
          {
            name: 'has_garden',
            type: 'boolean',
          },
          {
            name: 'max_tenants_amount',
            type: 'int',
          },
          {
            name: 'total_units',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'year_built',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'manager_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'condominiums',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_NAME',
        columnNames: ['condominium_name'],
      }),
    );

    await queryRunner.createIndex(
      'condominiums',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_ADDRESS',
        columnNames: ['address'],
      }),
    );

    await queryRunner.createIndex(
      'condominiums',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_CITY',
        columnNames: ['city'],
      }),
    );

    await queryRunner.createIndex(
      'condominiums',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_STATE',
        columnNames: ['state'],
      }),
    );

    await queryRunner.createIndex(
      'condominiums',
      new TableIndex({
        name: 'IDX_CONDOMINIUM_MANAGER_ID',
        columnNames: ['manager_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'condominiums',
      new TableForeignKey({
        columnNames: ['manager_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = (await queryRunner.getTable('condominiums')) as Table;
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('manager_id') !== -1,
    ) as TableForeignKey;

    await queryRunner.dropForeignKey('condominiums', foreignKey);
    await queryRunner.dropIndex('condominiums', 'IDX_CONDOMINIUM_MANAGER_ID');
    await queryRunner.dropIndex('condominiums', 'IDX_CONDOMINIUM_STATE');
    await queryRunner.dropIndex('condominiums', 'IDX_CONDOMINIUM_CITY');
    await queryRunner.dropIndex('condominiums', 'IDX_CONDOMINIUM_ADDRESS');
    await queryRunner.dropIndex('condominiums', 'IDX_CONDOMINIUM_NAME');
    await queryRunner.dropTable('condominiums');
  }
}
