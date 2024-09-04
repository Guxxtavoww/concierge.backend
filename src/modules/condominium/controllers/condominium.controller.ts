import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';

import { DecodedToken } from 'src/shared/decorators/decoded-token.decorator';

import { CondominiumService } from '../services/condominium.service';
import { CreateCondominiumDTO } from '../dtos/create-condominium.dto';

@ApiTags('condominium')
@Controller('condominium')
export class CondominiumController {
  constructor(private readonly condominiumService: CondominiumService) {}

  @Post()
  create(
    @Body() body: CreateCondominiumDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumService.createCondominium(body, decoded_token.id);
  }
}
