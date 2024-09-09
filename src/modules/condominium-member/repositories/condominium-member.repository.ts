import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { CondominiumMember } from '../entities/condominium-member.entity';

export const condominiumMemberRepository: Repository<CondominiumMember> =
  AppDataSource.getRepository(CondominiumMember);
