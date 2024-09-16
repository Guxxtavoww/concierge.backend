import { Module } from '@nestjs/common';
import { ScheduleModule as NestjsScheduleModule } from '@nestjs/schedule';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CondominiumModule } from './condominium/condominium.module';
import { CondominiumMemberModule } from './condominium-member/condominium-member.module';

@Module({
  imports: [
    NestjsScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    CondominiumModule,
    CondominiumMemberModule,
    ScheduleModule,
    HealthModule,
  ],
})
export class ConciergeModule {}
