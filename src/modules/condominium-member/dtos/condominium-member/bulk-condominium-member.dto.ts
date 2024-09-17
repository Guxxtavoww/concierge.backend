import { z } from 'nestjs-zod/z';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty } from '@nestjs/swagger';

import {
  CreateCondominiumMemberDTO,
  createCondominiumMemberSchema,
} from './create-condominium-member.dto';

export const bulkCondominiumMemberSchema = z.array(
  createCondominiumMemberSchema,
);

export type BulkCondominiumMemberType = z.infer<
  typeof bulkCondominiumMemberSchema
>;

export class BulkCondominiumMemberDTO extends createZodDto(
  bulkCondominiumMemberSchema,
) {
  @ApiProperty({
    description: 'An array of members to be added to the condominium.',
    type: [CreateCondominiumMemberDTO],
    example: [
      {
        condominium_id: '3f2a1c9a-8d77-4d92-8129-1234abc567de',
        is_tenant: true,
      },
      {
        condominium_id: 'aabbccdd-1122-3344-5566-77889900aabb',
        is_tenant: false,
      },
    ],
    isArray: true,
  })
  members: CreateCondominiumMemberDTO[];
}
