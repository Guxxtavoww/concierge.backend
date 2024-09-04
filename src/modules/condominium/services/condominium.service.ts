import { Injectable } from '@nestjs/common';

import { PaginationService } from 'src/lib/pagination/pagination.service';

import { Condominium } from '../entities/condominium.entity';
import type { CreateCondominiumType } from '../dtos/create-condominium.dto';
import { condominiumRepository } from '../repositories/condominium.repository';

@Injectable()
export class CondominiumService {
  constructor(private readonly paginationService: PaginationService) {}

  async createCondominium(
    payload: CreateCondominiumType,
    manager_id: string,
  ): Promise<Condominium> {
    const condominiumToCreate = Condominium.create({ ...payload, manager_id });

    return condominiumRepository.save(condominiumToCreate);
  }
}
