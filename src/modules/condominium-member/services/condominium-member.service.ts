import {
  Inject,
  forwardRef,
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import {
  applyOrderByFilters,
  applyQueryFilters,
} from 'src/utils/apply-query-filters.utils';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';
import { CondominiumService } from 'src/modules/condominium/services/condominium.service';

import {
  alias,
  base_fields,
  CondominiumMember,
  perfomatic_fields,
} from '../entities/condominium-member.entity';
import { ProfessionService } from './profession.service';
import { Profession } from '../entities/profession.entity';
import type { UpdateIsTenantType } from '../dtos/condominium-member/update-is-tenant.dto';
import { condominiumMemberRepository } from '../repositories/condominium-member.repository';
import { CreateCondominiumMemberPayload } from '../dtos/condominium-member/create-condominium-member.dto';
import { PaginateCondominiumsMembersPayload } from '../dtos/condominium-member/paginate-condominiums-members.dto';
import type { AssignOrRemoveProfessionsType } from '../dtos/condominium-member/assign-or-remove-professions.dto';

@Injectable()
export class CondominiumMemberService {
  constructor(
    private readonly paginationService: PaginationService,
    @Inject(forwardRef(() => CondominiumService))
    private readonly condominiumService: CondominiumService,
    private readonly professionService: ProfessionService,
  ) {}

  private createCondominiumMemberQueryBuilder() {
    return condominiumMemberRepository
      .createQueryBuilder(alias)
      .select(base_fields);
  }

  public createPerfomaticCondominiumMemberQueryBuilder() {
    return condominiumMemberRepository
      .createQueryBuilder(alias)
      .select(perfomatic_fields);
  }

  async paginateMemberships({
    limit,
    page,
    order_by_created_at,
    order_by_updated_at,
    ...filters
  }: PaginateCondominiumsMembersPayload) {
    const queryBuilder = this.createCondominiumMemberQueryBuilder();

    applyQueryFilters(alias, queryBuilder, filters, {
      condominium_id: '=',
      is_tenant: '=',
      user_id: '=',
    });

    applyOrderByFilters(alias, queryBuilder, {
      order_by_created_at,
      order_by_updated_at,
    });

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      limit,
      page,
    });
  }

  async getCondominiumMemberById(id: string) {
    const membership = await this.createCondominiumMemberQueryBuilder()
      .where(`${alias}.id = :id`, { id })
      .getOne();

    if (!membership) throw new NotFoundError('Member not found!');

    return membership;
  }

  async getMembershipByUserId(user_id: string) {
    const membership = await this.createCondominiumMemberQueryBuilder()
      .where(`${alias}.user_id = :user_id`, { user_id })
      .getOne();

    if (!membership) throw new NotFoundError('Member not found!');

    return membership;
  }

  async getMembershipsByUserIdsAndCondominiumId(
    condominium_id: string,
    user_ids: string[],
  ): Promise<Pick<CondominiumMember, 'condominium_id' | 'user_id'>[]> {
    const results = await this.createPerfomaticCondominiumMemberQueryBuilder()
      .where(`${alias}.condominium_id = :condominium_id`, { condominium_id })
      .andWhere(`${alias}.user_id IN (:...user_ids)`, {
        user_ids,
      })
      .take(user_ids.length)
      .getMany();

    return results;
  }

  async getMembershipByUserIdAndCondominiumId(
    user_id: string,
    condominium_id: string,
  ): Promise<NullableValue<CondominiumMember>> {
    const membership = await this.createCondominiumMemberQueryBuilder()
      .where(`${alias}.user_id = :user_id`, { user_id })
      .andWhere(`${alias}.condominium_id = :condominium_id`, {
        condominium_id,
      })
      .getOne();

    return membership;
  }

  async createCondominiumMember(
    condominium_id: string,
    { is_tenant, user_id }: CreateCondominiumMemberPayload,
  ) {
    const item = CondominiumMember.create({
      condominium_id,
      is_tenant,
      user_id,
    });

    return condominiumMemberRepository.save(item);
  }

  private professionQueryBuilder() {
    return condominiumMemberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.professions', 'profession')
      .select([
        'member.id',
        'member.user_id',
        'profession.id',
        'profession.name',
        'profession.profession_category_id',
      ]);
  }

  private updateMemberProfessions(
    condominium_member_id: string,
    professions: Profession[],
  ) {
    return condominiumMemberRepository.update(condominium_member_id, {
      professions,
    });
  }

  async getCondominiumMemberProfessionsByIdAndLoggedInUserId(
    member_id: string,
    logged_in_user_id: string,
  ) {
    const condominium_member = await this.professionQueryBuilder()
      .where('member.id = :member_id', { member_id })
      .andWhere('member.user_id = :logged_in_user_id', { logged_in_user_id })
      .getOne();

    if (!condominium_member)
      throw new NotFoundError('Member not found or access denied');

    return condominium_member;
  }

  async removeProfessionsFromMember(
    member_id: string,
    profession_ids: AssignOrRemoveProfessionsType,
    logged_in_user_id: string,
  ) {
    const condominium_member =
      await this.getCondominiumMemberProfessionsByIdAndLoggedInUserId(
        member_id,
        logged_in_user_id,
      );

    const filteredProfessions = condominium_member.professions.filter(
      (existingProfession) => !profession_ids.includes(existingProfession.id),
    );

    condominium_member.professions = filteredProfessions;

    await this.updateMemberProfessions(
      condominium_member.id,
      condominium_member.professions,
    );

    return condominium_member.professions;
  }

  async assignProfessionsToMember(
    member_id: string,
    professions_id: AssignOrRemoveProfessionsType,
    logged_in_user_id: string,
  ) {
    const condominium_member =
      await this.getCondominiumMemberProfessionsByIdAndLoggedInUserId(
        member_id,
        logged_in_user_id,
      );

    for (const existingProfession of condominium_member.professions) {
      if (professions_id.includes(existingProfession.id)) {
        throw new BadRequestException('Profession already assigned to member');
      }
    }

    const professions =
      await this.professionService.getProfessionsById(professions_id);

    condominium_member.professions = [
      ...condominium_member.professions,
      ...professions,
    ];

    await this.updateMemberProfessions(
      condominium_member.id,
      condominium_member.professions,
    );

    return condominium_member.professions;
  }

  async updateIsTenant(id: string, { is_tenant }: UpdateIsTenantType) {
    const member = await this.getCondominiumMemberById(id);

    return condominiumMemberRepository.update(member.id, {
      is_tenant,
    });
  }

  async deleteMembership(id: string, logged_in_user_id: string) {
    const {
      user_id,
      id: membershipToDeleteId,
      condominium_id,
    } = await this.getCondominiumMemberById(id);

    if (user_id !== logged_in_user_id) {
      throw new ForbiddenException('Not Allowed');
    }

    const condominium =
      await this.condominiumService.getCondominiumById(condominium_id);

    await this.condominiumService.updateTotalMemberCount(
      condominium,
      'decrement',
    );

    return condominiumMemberRepository.delete(membershipToDeleteId);
  }
}
