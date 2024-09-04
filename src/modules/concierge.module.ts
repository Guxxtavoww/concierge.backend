import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CondominiumModule } from './condominium/condominium.module';

@Module({
  imports: [UserModule, AuthModule, CondominiumModule],
})
export class ConciergeModule {}
