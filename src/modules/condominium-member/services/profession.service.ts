import { ForbiddenException, Injectable } from '@nestjs/common';

import {
  applyOrderByFilters,
  applyQueryFilters,
} from 'src/utils/apply-query-filters.utils';
import { isNullableValue } from 'src/utils/is-nullable-value.util';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';

import {
  Profession,
  professionAlias,
  base_profession_fields,
} from '../entities/profession.entity';
import { CondominiumMemberService } from './condominium-member.service';
import { ProfessionCategoryService } from './profession-category.service';
import { professionRepository } from '../repositories/profession.repository';
import type { ListProfessionsPayload } from '../dtos/profession/list-professions.dto';
import type { CreateProfessionPayload } from '../dtos/profession/create-profession.dto';
import type { UpdateProfessionPayload } from '../dtos/profession/update-profession.dto';
import { condominiumMemberRepository } from '../repositories/condominium-member.repository';

@Injectable()
export class ProfessionService {
  constructor(
    private readonly condominiumMemberService: CondominiumMemberService,
    private readonly professionCategoryService: ProfessionCategoryService,
  ) {}

  private createProfessionQueryBuilder() {
    return professionRepository
      .createQueryBuilder(professionAlias)
      .select(base_profession_fields);
  }

  listProfessions({
    order_by_created_at,
    order_by_updated_at,
    ...filters
  }: ListProfessionsPayload) {
    const queryBuilder = this.createProfessionQueryBuilder();

    applyQueryFilters(professionAlias, queryBuilder, filters, {
      description: 'LIKE',
      name: 'LIKE',
      profession_category_id: '=',
    });

    applyOrderByFilters(professionAlias, queryBuilder, {
      order_by_created_at,
      order_by_updated_at,
    });

    return queryBuilder.getMany();
  }

  async getProfessionById(id: number) {
    const profession = await this.createProfessionQueryBuilder()
      .where(`${professionAlias}.id = :id`, { id })
      .getOne();

    if (!profession) throw new NotFoundError('Invalid Profession');

    return profession;
  }

  async createProfession({
    name,
    profession_category_id,
    description,
  }: CreateProfessionPayload) {
    const profession_category =
      await this.professionCategoryService.getProfessionCategoryById(
        profession_category_id,
      );

    const professionToCreate = Profession.create({
      name,
      description,
      profession_category_id: profession_category.id,
    });

    return professionRepository.save(professionToCreate);
  }

  async assignProfessionToMember(
    member_id: string,
    profession_id: number,
    logged_in_user_id: string,
  ) {
    const [member, profession] = await Promise.all([
      this.condominiumMemberService.getMemberProfessions(member_id),
      this.getProfessionById(profession_id),
    ]);

    if (member.user_id !== logged_in_user_id)
      throw new ForbiddenException('Not allowed');

    member.professions.push(profession);

    try {
      await condominiumMemberRepository.update(member.id, {
        professions: member.professions,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateProfession(id: number, payload: UpdateProfessionPayload) {
    const professionToUpdate = await this.getProfessionById(id);

    if (!isNullableValue(payload.profession_category_id)) {
      const professionCategory =
        await this.professionCategoryService.getProfessionCategoryById(
          payload.profession_category_id,
        );

      professionToUpdate.profession_category_id = professionCategory.id;
    }

    professionToUpdate.name = payload.name || professionToUpdate.name;
    professionToUpdate.description =
      payload.description || professionToUpdate.description;

    return professionRepository.update(professionToUpdate.id, {
      name: professionToUpdate.name,
      description: professionToUpdate.description,
      profession_category_id: professionToUpdate.profession_category_id,
    });
  }

  async deleteProfession(id: number) {
    const professionToDelete = await this.getProfessionById(id);

    return professionRepository.remove(professionToDelete);
  }
}
