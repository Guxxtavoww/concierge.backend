import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';
import { CondominiumMember } from 'src/modules/condominium-member/entities/condominium-member.entity';

import { CondominiumChatMessage } from './condominium-chat-message.entity';
import type { CreateCondominiumChatType } from '../dtos/condominium-chat/create.dto';
import type { UpdateCondominiumChatType } from '../dtos/condominium-chat/update.dto';

@Entity('condominium-chats')
export class CondominiumChat extends Base {
  @Index()
  @Column('varchar')
  chat_title: string;

  @Column('varchar')
  chat_description: string;

  @Column('int', { default: 0 })
  messages_amount: number;

  @Column('int', { default: 0 })
  members_amount: number;

  @Index()
  @Column('uuid')
  admin_id: string;

  @ManyToOne(() => CondominiumMember, (member) => member.administrated_chats)
  @JoinColumn({ name: 'admin_id' })
  admin: CondominiumMember;

  @OneToMany(
    () => CondominiumChatMessage,
    (chat_message) => chat_message.condominium_chat,
  )
  messages: CondominiumChatMessage[];

  @ManyToMany(() => CondominiumMember, (member) => member.participating_chats)
  @JoinTable({
    name: 'condominium-chat-members', // Nome da tabela de junção
    joinColumn: {
      name: 'chat_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'member_id',
      referencedColumnName: 'id',
    },
  })
  participants: CondominiumMember[];

  static create(
    payload: Omit<CreateCondominiumChatType, 'members_ids'> & {
      admin_id: string;
    },
  ) {
    const item = new CondominiumChat();

    Object.assign(item, payload);

    return item;
  }

  static update(payload: UpdateCondominiumChatType) {
    const item = new CondominiumChat();

    Object.assign(item, payload);

    return item;
  }
}

export const adminAlias = 'admin';
export const participantsAlias = 'participants';
export const condominiumChatAlias = 'condominium-chat';

export type CondominiumChatSelect =
  | `${typeof condominiumChatAlias}.${keyof CondominiumChat}`
  | `${typeof adminAlias}.${keyof CondominiumMember}`;

export const base_fields = [
  'condominium-chat.id',
  'condominium-chat.chat_title',
  'condominium-chat.chat_description',
  'condominium-chat.members_amount',
  'condominium-chat.created_at',
  'condominium-chat.updated_at',
  'admin.id',
  'admin.condominium_id',
  'admin.is_tenant',
] satisfies CondominiumChatSelect[];
