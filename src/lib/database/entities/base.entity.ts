import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Base {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: null,
  })
  updated_at: NullableValue<string>;
}

@Entity()
export class BaseWithIncrementalId {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: null,
  })
  updated_at: NullableValue<string>;
}
