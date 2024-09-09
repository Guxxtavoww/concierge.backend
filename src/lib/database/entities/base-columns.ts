import type { TableColumnOptions } from 'typeorm';

export const baseColumns = [
  {
    name: 'id',
    type: 'uuid',
    generationStrategy: 'uuid',
    isPrimary: true,
    default: 'uuid_generate_v4()',
  },
  {
    name: 'created_at',
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP',
  },
  {
    name: 'updated_at',
    type: 'timestamp',
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
    isNullable: true,
  },
] satisfies TableColumnOptions[];

export const baseColumnsWithIncrementalId = [
  {
    name: 'id',
    type: 'int',
    isPrimary: true,
    isGenerated: true,
    generationStrategy: 'increment',
  },
  {
    name: 'created_at',
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP',
  },
  {
    name: 'updated_at',
    type: 'timestamp',
    default: null,
    onUpdate: 'CURRENT_TIMESTAMP',
    isNullable: true,
  },
] satisfies TableColumnOptions[];
