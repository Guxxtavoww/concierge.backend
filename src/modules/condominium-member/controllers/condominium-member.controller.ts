import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';

import { UuidParam } from 'src/shared/decorators/uuid-param.decorator';
import { DecodedToken } from 'src/shared/decorators/decoded-token.decorator';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination-query.decorator';

import { CondominiumMemberService } from '../services/condominium-member.service';
import { CreateCondominiumMemberDTO } from '../dtos/condominium-member/create-condominium-member.dto';
import { PaginateCondominiumsMembersDTO } from '../dtos/condominium-member/paginate-condominiums-members.dto';

@ApiTags('condominium-member')
@Controller('condominium-member')
export class CondominiumMemberController {
  constructor(
    private readonly condominiumMemberService: CondominiumMemberService,
  ) {}

  @ApiPaginationQuery()
  @Get('paginate')
  paginate(@Query() querys: PaginateCondominiumsMembersDTO) {
    return this.condominiumMemberService.paginateMemberships(querys);
  }

  @Get('membership/:user_id/:condominium_id')
  getMembership(
    @UuidParam('user_id') user_id: string,
    @UuidParam('condominium_id') condominium_id: string,
  ) {
    return this.condominiumMemberService.getMembershipByUserIdAndCondominiumId(
      user_id,
      condominium_id,
    );
  }

  @Post()
  createMember(
    @Body() body: CreateCondominiumMemberDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumMemberService.createCondominiumMember(
      body,
      decoded_token.id,
    );
  }

  @Delete(':id')
  deleteMembership(
    @UuidParam('id') id: string,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumMemberService.deleteMembership(id, decoded_token.id);
  }
}
