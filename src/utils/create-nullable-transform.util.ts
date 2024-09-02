import type { ZodSchema, ZodTypeDef } from 'nestjs-zod/z';

import { isNullableValue } from './is-nullable-value.util';

export function createNullableTransform<
  TOutput = any,
  TDef extends ZodTypeDef = ZodTypeDef,
  TInput = TOutput,
>(schema: ZodSchema<TOutput, TDef, TInput>) {
  return schema
    .optional()
    .nullable()
    .transform((value) => (isNullableValue(value) ? undefined : value));
}
