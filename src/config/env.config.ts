import 'dotenv/config';
import { z } from 'nestjs-zod/z';

import {
  stringSchema,
  optionalStringSchema,
  optionalStringToNumberSchema,
  urlStringSchema,
} from 'src/shared/schemas.shared';

export const envSchema = z.object({
  DATABASE_ROOT_PASSWORD: stringSchema,
  DATABASE_DATABASE_NAME: stringSchema,
  DB_PORT: optionalStringToNumberSchema.default('5432'),
  DATABASE_HOST: optionalStringSchema.default('localhost'),
  DB_USER: stringSchema,
  JWT_SECRET: stringSchema,
  JWT_ISSUER: urlStringSchema,
  JWT_AUDIENCE: urlStringSchema,
  JWT_EXPIRES_IN: stringSchema,
  PORT: optionalStringToNumberSchema.default('5000'),
  WEBSOCKET_PORT: optionalStringToNumberSchema.default('80'),
  ENV: z.enum(['prod', 'dev']).default('dev'),
});

export type EnvType = z.infer<typeof envSchema>;

export const ENV_VARIABLES = envSchema.parse(process.env);
