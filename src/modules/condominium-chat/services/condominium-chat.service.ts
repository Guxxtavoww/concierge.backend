import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import {
  applyQueryFilters,
  applyOrderByFilters,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { CondominiumMember } from 'src/modules/condominium-member/entities/condominium-member.entity';
import { CondominiumMemberService } from 'src/modules/condominium-member/services/condominium-member.service';

import {
  adminAlias,
  base_fields,
  CondominiumChat,
  participantsAlias,
  condominiumChatAlias,
} from '../entities/condominium-chat.entity';
import type { CreateCondominiumChatType } from '../dtos/condominium-chat/create.dto';
import type { UpdateCondominiumChatType } from '../dtos/condominium-chat/update.dto';
import { condominiumChatRepository } from '../repositories/condominium-chat.repository';
import type { PaginateCondominiumChatsType } from '../dtos/condominium-chat/paginate.dto';
import { BadRequestError } from 'src/lib/http-exceptions/errors/types/bad-request-error';

@Injectable()
export class CondominiumChatService {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly condominiumMemberService: CondominiumMemberService,
  ) {}

  private createCondominiumChatQueryBuilder() {
    const queryBuilder = condominiumChatRepository
      .createQueryBuilder(condominiumChatAlias)
      .leftJoinAndSelect(`${condominiumChatAlias}.${adminAlias}`, adminAlias)
      .select(base_fields);

    return queryBuilder;
  }

  private async checkPermission(
    condominium_chat: CondominiumChat,
    logged_in_user_id: string,
  ) {
    const member =
      await this.condominiumMemberService.getMembershipByUserIdAndCondominiumId(
        logged_in_user_id,
        condominium_chat.admin.condominium_id,
      );

    if (!member) throw new ForbiddenException('Not a member');

    if (member.user_id !== logged_in_user_id)
      throw new ForbiddenException('Cant peform this action');
  }

  private async validateChatAndPermission(
    chat_id: string,
    logged_in_user_id: string,
  ) {
    const chat = await this.getCondominiumChatById(chat_id);

    await this.checkPermission(chat, logged_in_user_id);

    return chat;
  }

  async paginateCondominiumChats({
    page,
    limit,
    admin_id,
    chat_description,
    chat_title,
    ...orderBy
  }: PaginateCondominiumChatsType) {
    const queryBuilder = this.createCondominiumChatQueryBuilder();

    applyQueryFilters(
      condominiumChatAlias,
      queryBuilder,
      { chat_description, chat_title },
      { chat_description: 'LIKE', chat_title: 'LIKE' },
    );
    applyQueryFilters(adminAlias, queryBuilder, { id: admin_id }, { id: '=' });
    applyOrderByFilters(condominiumChatAlias, queryBuilder, orderBy);

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      page,
      limit,
    });
  }

  async getCondominiumChatById(id: string): Promise<CondominiumChat> {
    const chat = await this.createCondominiumChatQueryBuilder()
      .where(`${condominiumChatAlias}.id = :id`, { id })
      .getOne();

    if (!chat) throw new NotFoundError('Chat not found');

    return chat;
  }

  async createCondominiumChat(
    condominium_id: string,
    { chat_description, chat_title, members_ids }: CreateCondominiumChatType,
    logged_in_user_id: string,
  ): Promise<CondominiumChat> {
    const condominiumMember =
      await this.condominiumMemberService.getMembershipByUserIdAndCondominiumId(
        logged_in_user_id,
        condominium_id,
      );

    if (!condominiumMember) throw new ForbiddenException('Not a member');

    const chatToCreate = CondominiumChat.create({
      chat_description,
      chat_title,
      admin_id: condominiumMember.id,
    });

    members_ids.push(condominiumMember.id);

    const savedChat = await condominiumChatRepository
      .save(chatToCreate)
      .then((chat) => this.getCondominiumChatById(chat.id));

    if (members_ids.length) {
      await this.addParticipantsToChat(
        savedChat,
        members_ids,
        logged_in_user_id,
      );
    }

    return savedChat;
  }

  private async validateCondominiumMembers(
    chat: CondominiumChat,
    member_ids: string[],
  ): Promise<CondominiumMember[]> {
    const memberIdsSet = new Set(member_ids);
    const memberIds = [...memberIdsSet];

    const members =
      (await this.condominiumMemberService.getMembershipsByMemberIdsAndCondominiumId(
        chat.admin.condominium_id,
        memberIds,
      )) as CondominiumMember[];

    if (members.length !== memberIdsSet.size) {
      const foundMemberIdsSet = new Set(members.map((member) => member.id));
      const nonMembers: string[] = [];

      for (const id of memberIdsSet) {
        if (!foundMemberIdsSet.has(id)) nonMembers.push(id);
      }

      if (nonMembers.length > 0) {
        throw new NotFoundError(
          `Some members are not part of the condominium: ${nonMembers.join(', ')}`,
        );
      }
    }

    const participantsIds =
      await this.getCondominiumChatParticipantsIdsByChatId(chat.id);

    // Usar um Set para IDs de membros já no chat para verificação rápida
    const chatMemberIdsSet = new Set(participantsIds);
    const membersAlreadyInChat: string[] = [];

    for (const member of members) {
      if (chatMemberIdsSet.has(member.id)) membersAlreadyInChat.push(member.id);
    }

    // Lançar erro se houver membros já no chat
    if (membersAlreadyInChat.length > 0) {
      throw new ConflictException(
        `Some members are already part of the chat: ${membersAlreadyInChat.join(', ')}`,
      );
    }

    return members;
  }

  private createParticipantQueryBuilder() {
    return condominiumChatRepository
      .createQueryBuilder(condominiumChatAlias)
      .leftJoinAndSelect(
        `${condominiumChatAlias}.${participantsAlias}`,
        participantsAlias,
      )
      .select(`${participantsAlias}.id`);
  }

  async getCondominiumChatParticipantsIdsByChatId(
    chat_id: string,
  ): Promise<string[]> {
    const participants = await this.createParticipantQueryBuilder()
      .where(`${condominiumChatAlias}.id = :chat_id`, { chat_id })
      .getMany();

    const participantsIds: string[] = [];

    for (const participant of participants)
      participantsIds.push(participant.id);

    return participantsIds;
  }

  async getChatParticipantIdByChatId(
    chat_id: string,
    member_id: string,
  ) {
    const participant = await this.createParticipantQueryBuilder()
      .where(`${condominiumChatAlias}.id = :chat_id`, { chat_id })
      .andWhere(`${participantsAlias}.id = :member_id`, { member_id })
      .getOne();

    if (!participant) throw new NotFoundError('Invalid participant or chat!');

    return participant;
  }

  async addParticipantsToChat(
    chat_id_or_entity: string | CondominiumChat,
    member_ids: string[],
    logged_in_user_id: string,
  ) {
    const chat =
      typeof chat_id_or_entity === 'string'
        ? await this.validateChatAndPermission(
            chat_id_or_entity,
            logged_in_user_id,
          )
        : chat_id_or_entity;

    // valida se cada membro faz parte do condominium
    const membersToParticipate = await this.validateCondominiumMembers(
      chat,
      member_ids,
    );

    // Obter os IDs dos participantes já existentes no chat
    const existingParticipantsIds =
      await this.getCondominiumChatParticipantsIdsByChatId(chat.id);

    const existingParticipantsSet = new Set(existingParticipantsIds);

    // Filtrar novos participantes que ainda não estão no chat
    const newParticipants = membersToParticipate.filter(
      (member) => !existingParticipantsSet.has(member.id),
    );

    if (!newParticipants.length) {
      throw new ForbiddenException(
        'All members are already participants of the chat',
      );
    }

    chat.participants = [
      ...existingParticipantsIds.map((id) => ({ id }) as CondominiumMember),
      ...newParticipants,
    ];
    chat.members_amount = chat.participants.length;

    await Promise.all([
      condominiumChatRepository.save(chat),
      condominiumChatRepository.update(chat.id, {
        members_amount: chat.members_amount,
      }),
    ]);

    return chat.participants;
  }

  // Função para remover participantes do chat
  async removeParticipantsFromChat(
    chat_id: string,
    member_ids: string[],
    logged_in_user_id: string,
  ) {
    // Valida permissões do usuário para o chat
    const chat = await this.validateChatAndPermission(
      chat_id,
      logged_in_user_id,
    );

    if (member_ids.includes(chat.admin.id))
      throw new BadRequestError('Cannot remove the admin');

    // Valida se os membros fornecidos pertencem ao condomínio
    // Obter IDs dos participantes atuais do chat
    const [membersToRemove, currentParticipantsIds] = await Promise.all([
      this.validateCondominiumMembers(chat, member_ids),
      this.getCondominiumChatParticipantsIdsByChatId(chat.id),
    ]);

    const currentParticipantsSet = new Set(currentParticipantsIds);

    const participantsToRemove = membersToRemove.filter((member) =>
      currentParticipantsSet.has(member.id),
    );

    if (!participantsToRemove.length) {
      throw new ForbiddenException(
        'None of the members are participants of the chat',
      );
    }

    // Remove os IDs dos participantes que devem ser removidos do conjunto de participantes atuais
    const remainingParticipantsIds = currentParticipantsIds.filter(
      (id) => !participantsToRemove.some((member) => member.id === id),
    );

    // Atualiza a relação de participantes no chat
    await condominiumChatRepository
      .createQueryBuilder()
      .relation(CondominiumChat, 'participants')
      .of(chat.id)
      .remove(participantsToRemove.map((member) => member.id));

    // Atualiza o número de membros do chat
    chat.members_amount = remainingParticipantsIds.length;

    // Persistir a atualização no banco de dados
    await condominiumChatRepository.update(chat.id, {
      members_amount: chat.members_amount,
    });

    return remainingParticipantsIds;
  }

  async updateCondominiumChat(
    chat_id: string,
    payload: UpdateCondominiumChatType,
    logged_in_user_id: string,
  ) {
    const chatToUpdate = await this.validateChatAndPermission(
      chat_id,
      logged_in_user_id,
    );

    const updatedItem = CondominiumChat.update(payload);

    return condominiumChatRepository.update(chatToUpdate.id, updatedItem);
  }

  async deleteCondominiumChat(chat_id: string, logged_in_user_id: string) {
    const chatToDelete = await this.validateChatAndPermission(
      chat_id,
      logged_in_user_id,
    );

    return condominiumChatRepository.remove(chatToDelete);
  }
}
