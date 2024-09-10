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

import { ProfessionService } from '../services/profession.service';
import { ListProfessionsDTO } from '../dtos/profession/list-professions.dto';
import { CreateProfessionDTO } from '../dtos/profession/create-profession.dto';
import { UpdateProfessionDTO } from '../dtos/profession/update-profession.dto';

@ApiTags('profession')
@Controller('profession')
export class ProfessionController {
  constructor(private readonly professionService: ProfessionService) {}

  @Get('list')
  list(@Query() querys: ListProfessionsDTO) {
    return this.professionService.listProfessions(querys);
  }

  @Post()
  create(@Body() body: CreateProfessionDTO) {
    return this.professionService.createProfession(body);
  }

  @Put(':id')
  update(@NumberParam('id') id: number, @Body() body: UpdateProfessionDTO) {
    return this.professionService.updateProfession(id, body);
  }

  @Delete(':id')
  delete(@NumberParam('id') id: number) {
    return this.professionService.deleteProfession(id);
  }
}
