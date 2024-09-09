import { forwardRef, Module } from '@nestjs/common';

import { CondominiumService } from './services/condominium.service';
import { CondominiumController } from './controllers/condominium.controller';
import { CondominiumMemberModule } from '../condominium-member/condominium-member.module';

@Module({
  imports: [forwardRef(() => CondominiumMemberModule)],
  providers: [CondominiumService],
  controllers: [CondominiumController],
  exports: [CondominiumService],
})
export class CondominiumModule {}
