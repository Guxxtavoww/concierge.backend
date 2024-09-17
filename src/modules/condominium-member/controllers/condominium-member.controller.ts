import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';

import { UuidParam } from 'src/shared/decorators/uuid-param.decorator';
import { DecodedToken } from 'src/shared/decorators/decoded-token.decorator';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination-query.decorator';

import { CondominiumMemberService } from '../services/condominium-member.service';
import { BulkCondominiumMemberDTO } from '../dtos/condominium-member/bulk-condominium-member.dto';
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

  @Post(':condominium_id')
  createMember(
    @UuidParam('condominium_id') condominium_id: string,
    @Body() body: CreateCondominiumMemberDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumMemberService.createCondominiumMember(
      condominium_id,
      body,
      decoded_token.id,
    );
  }

  @ApiBody({
    type: [BulkCondominiumMemberDTO],
    description: 'Array of members to be added',
    examples: {
      a: {
        summary: 'Sample request',
        value: [
          {
            user_id: '3f2a1c9a-8d77-4d92-8129-1234abc567de',
            is_tenant: true,
          },
          {
            user_id: 'aabbccdd-1122-3344-5566-77889900aabb',
            is_tenant: false,
          },
        ],
      },
    },
  })
  @Post('bulk/:condominium_id')
  bulkMembers(
    @UuidParam('condominium_id') condominium_id: string,
    @Body() body: BulkCondominiumMemberDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.condominiumMemberService.bulkCondominiumMembers(
      condominium_id,
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
