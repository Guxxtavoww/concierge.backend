import { Injectable } from '@nestjs/common';

import {
  applyOrderByFilters,
  applyQueryFilters,
} from 'src/utils/apply-query-filters.utils';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';

import {
  ProfessionCategory,
  professionCategoryAlias,
  base_profession_category_fields,
} from '../entities/profession-category.entity';
import { professionCategoryRepository } from '../repositories/profession-category.repository';
import type { CreateProfessionCategoryPayload } from '../dtos/profession-category/create-profession-category.dto';
import type { UpdateProfessionCategoryPayload } from '../dtos/profession-category/update-profession-category.dto';
import type { ListProfessionsCategoriesPayload } from '../dtos/profession-category/list-professions-categories.dto';

@Injectable()
export class ProfessionCategoryService {
  private createProfessionCategoryQueryBuilder() {
    return professionCategoryRepository
      .createQueryBuilder(professionCategoryAlias)
      .select(base_profession_category_fields);
  }

  async listProfessionsCategories({
    order_by_created_at,
    order_by_updated_at,
    ...filters
  }: ListProfessionsCategoriesPayload) {
    const queryBuilder = this.createProfessionCategoryQueryBuilder();

    applyQueryFilters(professionCategoryAlias, queryBuilder, filters, {
      category_description: 'LIKE',
      category_name: 'LIKE',
    });

    applyOrderByFilters(professionCategoryAlias, queryBuilder, {
      order_by_created_at,
      order_by_updated_at,
    });

    return queryBuilder.getMany();
  }

  async createProfessionCategory(payload: CreateProfessionCategoryPayload) {
    const categoryToCreate = ProfessionCategory.create(payload);

    return professionCategoryRepository.save(categoryToCreate);
  }

  async getProfessionCategoryById(id: number): Promise<ProfessionCategory> {
    const profession_category =
      await this.createProfessionCategoryQueryBuilder()
        .where(`${professionCategoryAlias}.id = :id`, { id })
        .getOne();

    if (!profession_category) throw new NotFoundError('Invalid Category');

    return profession_category;
  }

  async updateProfessionCategory(
    id: number,
    payload: UpdateProfessionCategoryPayload,
  ) {
    const categoryToUpdate = await this.getProfessionCategoryById(id);

    const item = ProfessionCategory.update(payload);

    return professionCategoryRepository.update(categoryToUpdate.id, item);
  }

  async deleteProfessionCategory(id: number) {
    const categoryToDelete = await this.getProfessionCategoryById(id);

    return professionCategoryRepository.remove(categoryToDelete);
  }
}
