import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';

import { UuidParam } from 'src/shared/decorators/uuid-param.decorator';
import { DecodedToken } from 'src/shared/decorators/decoded-token.decorator';
import { ApiPaginationQuery } from 'src/shared/decorators/api-pagination-query.decorator';
import { DataBaseInterceptorDecorator } from 'src/shared/decorators/database-interceptor.decorator';

import { MembershipInvitationService } from '../services/membership-invitation.service';
import { SendMembershipInvitationDTO } from '../dtos/membership-invitation/send-membership-invitation.dto';
import { BulkMembershipInvitationsDTO } from '../dtos/membership-invitation/bulk-membership-invitations.dto';
import { PaginateMembershipInvitationsDTO } from '../dtos/membership-invitation/paginate-membership-invitations.dto';

@ApiTags('membership-invitation')
@Controller('membership-invitation')
export class MembershipInvitationController {
  constructor(
    private readonly membershipInvitationService: MembershipInvitationService,
  ) {}

  @ApiPaginationQuery()
  @Get('paginate')
  paginate(@Query() querys: PaginateMembershipInvitationsDTO) {
    return this.membershipInvitationService.paginateMembershipInvitations(
      querys,
    );
  }

  @Get(':id')
  getOne(@UuidParam('id') id: string) {
    return this.membershipInvitationService.getMembershipInvitationById(id);
  }

  @Get('by-user-id/:user_id')
  getByUserId(@UuidParam('user_id') user_id: string) {
    return this.membershipInvitationService.getMembershipInvitationByUserId(
      user_id,
    );
  }

  @DataBaseInterceptorDecorator()
  @Post('send-invite/:condominium_id')
  sendInvite(
    @UuidParam('condominium_id') condominium_id: string,
    @Body() payload: SendMembershipInvitationDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.membershipInvitationService.sendMembershipInvitation(
      condominium_id,
      payload,
      decoded_token.id,
    );
  }

  @DataBaseInterceptorDecorator()
  @Post('bulk-invites/:condominium_id')
  @ApiBody({
    type: BulkMembershipInvitationsDTO,
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
  bulkMembershipInvitations(
    @UuidParam('condominium_id') condominium_id: string,
    @Body() payload: BulkMembershipInvitationsDTO,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.membershipInvitationService.bulkMembershipInvitations(
      condominium_id,
      payload,
      decoded_token.id,
    );
  }

  @Put('accept-invitation/:id')
  acceptMembershipInvitation(
    @UuidParam('id') id: string,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.membershipInvitationService.handleInvitation(
      id,
      decoded_token.id,
      'accept',
    );
  }

  @Put('decline-invitation/:id')
  declineMembershipInvitation(
    @UuidParam('id') id: string,
    @DecodedToken() decoded_token: DecodedTokenType,
  ) {
    return this.membershipInvitationService.handleInvitation(
      id,
      decoded_token.id,
      'decline',
    );
  }
}
