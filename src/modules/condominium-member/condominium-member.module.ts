import { forwardRef, Module } from '@nestjs/common';

import { ProfessionService } from './services/profession.service';
import { CondominiumModule } from '../condominium/condominium.module';
import { ProfessionController } from './controllers/profession.controller';
import { CondominiumMemberService } from './services/condominium-member.service';
import { ProfessionCategoryService } from './services/profession-category.service';
import { CondominiumMemberController } from './controllers/condominium-member.controller';
import { ProfessionCategoryController } from './controllers/profession-category.controller';

@Module({
  imports: [forwardRef(() => CondominiumModule)],
  controllers: [
    CondominiumMemberController,
    ProfessionController,
    ProfessionCategoryController,
  ],
  providers: [
    CondominiumMemberService,
    ProfessionCategoryService,
    ProfessionService,
  ],
  exports: [
    CondominiumMemberService,
    ProfessionCategoryService,
    ProfessionService,
  ],
})
export class CondominiumMemberModule {}
