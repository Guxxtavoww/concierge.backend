import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { Base } from 'src/lib/database/entities/base.entity';
import { CondominiumMember } from 'src/modules/condominium-member/entities/condominium-member.entity';

import { CondominiumChat } from './condominium-chat.entity';
import type { CreateCondominiumChatMessageType } from '../dtos/condominium-chat-message/create.dto';
import type { UpdateCondominiumChatMessageType } from '../dtos/condominium-chat-message/update.dto';

export const maxLengthForMessageText = 2200;

@Entity('condominium-chat-messages')
export class CondominiumChatMessage extends Base {
  @Index()
  @Column('varchar', { length: maxLengthForMessageText })
  message_text: string;

  @Index()
  @Column('uuid')
  condominium_chat_id: string;

  @Index()
  @Column('uuid')
  sended_by_id: string;

  @ManyToOne(() => CondominiumMember, (member) => member.sended_messages)
  @JoinColumn({ name: 'sended_by_id' })
  sended_by: CondominiumMember;

  @ManyToOne(() => CondominiumChat, (chat) => chat.messages)
  @JoinColumn({ name: 'condominium_chat_id' })
  condominium_chat: CondominiumChat;

  static create(payload: CreateCondominiumChatMessageType) {
    const item = new CondominiumChatMessage();

    Object.assign(item, payload);

    return item;
  }

  static update(
    payload: Pick<UpdateCondominiumChatMessageType, 'message_text'>,
  ) {
    const item = new CondominiumChatMessage();

    Object.assign(item, payload);

    return item;
  }
}

export const condominiumChatMessageAlias = 'condominium-chat-message';

export type CondominiumChatMessageSelect =
  `${typeof condominiumChatMessageAlias}.${keyof CondominiumChatMessage}`;

export const base_fields = [
  'condominium-chat-message.id',
  'condominium-chat-message.message_text',
  'condominium-chat-message.condominium_chat_id',
  'condominium-chat-message.sended_by_id',
  'condominium-chat-message.created_at',
  'condominium-chat-message.updated_at',
] satisfies CondominiumChatMessageSelect[];
