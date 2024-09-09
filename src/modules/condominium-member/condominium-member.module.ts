import { forwardRef, Module } from '@nestjs/common';

import { CondominiumModule } from '../condominium/condominium.module';
import { CondominiumMemberService } from './services/condominium-member.service';
import { CondominiumMemberController } from './controllers/condominium-member.controller';

@Module({
  imports: [forwardRef(() => CondominiumModule)],
  controllers: [CondominiumMemberController],
  providers: [CondominiumMemberService],
  exports: [CondominiumMemberService]
})
export class CondominiumMemberModule {}
