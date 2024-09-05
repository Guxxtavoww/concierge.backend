import { ForbiddenException, Injectable } from '@nestjs/common';

import { applyQueryFilters } from 'src/utils/apply-query-filters.util';
import { PaginationService } from 'src/lib/pagination/pagination.service';
import { NotFoundError } from 'src/lib/http-exceptions/errors/types/not-found-error';

import { userRepository } from '../repositories/user.repository';
import type { CreateUserPayload } from '../dtos/create-user.dto';
import type { UpdateUserPayload } from '../dtos/update-user.dto';
import { User, alias, base_fields } from '../entities/user.entity';
import type { PaginateUsersPayload } from '../dtos/paginate-users.dto';

@Injectable()
export class UserService {
  constructor(private readonly paginationService: PaginationService) {}

  private createUserQueryBuilder(selectPassword?: boolean) {
    const baseQueryBuilder = userRepository
      .createQueryBuilder(alias)
      .select(base_fields);

    if (selectPassword) {
      baseQueryBuilder.select([...base_fields, `${alias}.hashed_password`]);
    }

    return baseQueryBuilder;
  }

  async paginateUsers({
    limit,
    page,
    order_by_created_at,
    order_by_updated_at,
    user_name,
  }: PaginateUsersPayload) {
    const queryBuilder = this.createUserQueryBuilder();

    applyQueryFilters(
      alias,
      queryBuilder,
      { user_name },
      { user_name: 'LIKE' },
    );

    this.paginationService.applyOrderByFilters(alias, queryBuilder, {
      order_by_created_at,
      order_by_updated_at,
    });

    return this.paginationService.paginateWithQueryBuilder(queryBuilder, {
      limit,
      page,
    });
  }

  async getUserByEmail(user_email: string, selectPassword = true) {
    const user = await this.createUserQueryBuilder(selectPassword)
      .where(`${alias}.user_email = :user_email`, { user_email })
      .getOne();

    if (!user) throw new NotFoundError('Email is not valid!');

    return user;
  }

  async getUserById(id: string, selectPassword?: boolean) {
    const user = await this.createUserQueryBuilder(selectPassword)
      .where(`'${alias}.id = :id'`, { id })
      .getOne();

    if (!user) throw new NotFoundError('User not found!');

    return user;
  }

  async createUser(payload: CreateUserPayload) {
    const userToCreate = await User.create(payload);

    return userRepository.save(userToCreate);
  }

  async updateUser(
    id: string,
    payload: UpdateUserPayload,
    logged_in_user_id: string,
  ) {
    const userToUpdate = await this.getUserById(id, true);

    this.checkUserPermission(userToUpdate.id, logged_in_user_id);

    const userItem = await User.update(payload, userToUpdate.hashed_password);

    await userRepository.update(userToUpdate.id, userItem);

    return this.getUserById(userToUpdate.id);
  }

  async deleteUser(id: string, logged_in_user_id: string) {
    const userToDelete = await this.getUserById(id);

    this.checkUserPermission(userToDelete.id, logged_in_user_id);

    return userRepository.delete(userToDelete.id);
  }

  private checkUserPermission(incoming_id: string, logged_in_user_id: string) {
    if (incoming_id !== logged_in_user_id) {
      throw new ForbiddenException(
        'Não é permitido alterar ou deletar um usuario que não é seu',
      );
    }
  }
}
