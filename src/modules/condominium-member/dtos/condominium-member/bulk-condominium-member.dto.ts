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
) {}
