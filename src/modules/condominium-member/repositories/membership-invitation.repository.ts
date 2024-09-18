import { Repository } from 'typeorm';

import { AppDataSource } from 'src/lib/database/database.providers';

import { MembershipInvitation } from '../entities/membership-invitation.entity';

export const membershipInvitationRepository: Repository<MembershipInvitation> =
  AppDataSource.getRepository(MembershipInvitation);
