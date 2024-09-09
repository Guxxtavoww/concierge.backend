import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CondominiumModule } from './condominium/condominium.module';
import { CondominiumMemberModule } from './condominium-member/condominium-member.module';

@Module({
  imports: [UserModule, AuthModule, CondominiumModule, CondominiumMemberModule],
})
export class ConciergeModule {}
