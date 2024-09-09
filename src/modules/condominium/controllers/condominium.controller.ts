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

import { UuidParam } from 'src/shared/decorators/uuid-param.decorator';
import { DecodedToken } from 'src/shared/decorators/decoded-token.decorator';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination-query.decorator';
import { DataBaseInterceptorDecorator } from 'src/shared/decorators/database-interceptor.decorator';

import { CondominiumService } from '../services/condominium.service';
import { UpdateCondominiumDTO } from '../dtos/update-condominium.dto';
import { CreateCondominiumDTO } from '../dtos/create-condominium.dto';
import { PaginateCondominiumsDTO } from '../dtos/paginate-condominiums.dto';

@ApiTags('condominium')
@Controller('condominium')
export class CondominiumController {
  constructor(private readonly condominiumService: CondominiumService) {}

  @Get('paginate')
  @ApiPaginationQuery()
  paginate(
    @Query() querys: PaginateCondominiumsDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumService.paginateCondominiums(
      querys,
      decoded_token.id,
    );
  }

  @Get(':id')
  getOne(@UuidParam('id') id: string) {
    return this.condominiumService.getCondominiumById(id);
  }

  @DataBaseInterceptorDecorator()
  @Post()
  create(
    @Body() body: CreateCondominiumDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumService.createCondominium(body, decoded_token.id);
  }

  @DataBaseInterceptorDecorator()
  @Put(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateCondominiumDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumService.updateCondominium(
      id,
      body,
      decoded_token.id,
    );
  }

  @DataBaseInterceptorDecorator()
  @Delete(':id')
  delete(
    @UuidParam('id') id: string,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumService.deleteCondominium(id, decoded_token.id);
  }
}
