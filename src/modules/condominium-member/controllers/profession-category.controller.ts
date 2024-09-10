import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { NumberParam } from 'src/shared/decorators/number-param.decorator';

import { ProfessionCategoryService } from '../services/profession-category.service';
import { CreateProfessionCategoryDTO } from '../dtos/profession-category/create-profession-category.dto';
import { UpdateProfessionCategoryDTO } from '../dtos/profession-category/update-profession-category.dto';
import { ListProfessionsCategoriesDTO } from '../dtos/profession-category/list-professions-categories.dto';

@ApiTags('profession-category')
@Controller('profession-category')
export class ProfessionCategoryController {
  constructor(
    private readonly professionCategoryService: ProfessionCategoryService,
  ) {}

  @Get('list')
  list(@Query() querys: ListProfessionsCategoriesDTO) {
    return this.professionCategoryService.listProfessionsCategories(querys);
  }

  @Post()
  create(@Body() body: CreateProfessionCategoryDTO) {
    return this.professionCategoryService.createProfessionCategory(body);
  }

  @Put(':id')
  update(
    @NumberParam('id') id: number,
    @Body() body: UpdateProfessionCategoryDTO,
  ) {
    return this.professionCategoryService.updateProfessionCategory(id, body);
  }

  @Delete(':id')
  delete(@NumberParam('id') id: number) {
    return this.professionCategoryService.deleteProfessionCategory(id);
  }
}
