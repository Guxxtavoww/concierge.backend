import 'dotenv/config';
import { z } from 'nestjs-zod/z';

import {
  stringSchema,
  optionalStringSchema,
  optionalUrlStringSchema,
  optionalStringToIntegerSchema,
} from 'src/shared/schemas.shared';

export const envSchema = z.object({
  DATABASE_ROOT_PASSWORD: stringSchema,
  DATABASE_DATABASE_NAME: stringSchema,
  DB_PORT: optionalStringToIntegerSchema.default('5432'),
  DATABASE_HOST: optionalStringSchema.default('localhost'),
  REDIS_HOST: optionalStringSchema.default('localhost'),
  REDIS_PASSWORD: stringSchema,
  REDIS_PORT: optionalStringToIntegerSchema.default('6379'),
  DB_USER: stringSchema,
  JWT_SECRET: stringSchema,
  JWT_REFRESH_SECRET: stringSchema,
  JWT_REFRESH_EXPIRES_IN: stringSchema,
  JWT_ISSUER: optionalUrlStringSchema,
  JWT_AUDIENCE: optionalUrlStringSchema,
  JWT_EXPIRES_IN: stringSchema,
  PORT: optionalStringToIntegerSchema.default('5000'),
  WEBSOCKET_PORT: optionalStringToIntegerSchema.default('9090'),
  ENV: z.enum(['prod', 'dev']).default('dev'),
});

export type EnvType = z.infer<typeof envSchema>;

export const ENV_VARIABLES = envSchema.parse(process.env);

export const IS_DEV_ENV = ENV_VARIABLES.ENV === 'dev';
