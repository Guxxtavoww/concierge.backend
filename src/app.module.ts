import { APP_PIPE } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';
import { ScheduleModule } from '@nestjs/schedule';
import { Module, type OnModuleInit } from '@nestjs/common';

import { LogModule } from './lib/log/log.module';
import { ENV_VARIABLES } from './config/env.config';
import { ConciergeModule } from './modules/concierge.module';
import { AppDataSource } from './lib/database/database.providers';
import { PaginationModule } from './lib/pagination/pagination.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    ConciergeModule,
    PaginationModule,
    LogModule,
    BullModule.forRoot({
      redis: {
        host: ENV_VARIABLES.REDIS_HOST,
        port: ENV_VARIABLES.REDIS_PORT,
        password: ENV_VARIABLES.REDIS_PASSWORD,
      },
    }),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    try {
      await AppDataSource.initialize();
    } catch (err) {
      throw err;
    }
  }
}
