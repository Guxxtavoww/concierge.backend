import { Module, type OnModuleInit } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';

import { LogModule } from './lib/log/log.module';
import { ConciergeModule } from './modules/concierge.module';
import { AppDataSource } from './lib/database/database.providers';
import { PaginationModule } from './lib/pagination/pagination.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConciergeModule,
    PaginationModule,
    LogModule,
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
