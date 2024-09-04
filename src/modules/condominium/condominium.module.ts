import { Module } from '@nestjs/common';

import { CondominiumService } from './services/condominium.service';
import { CondominiumController } from './controllers/condominium.controller';

@Module({
  providers: [CondominiumService],
  controllers: [CondominiumController],
})
export class CondominiumModule {}
