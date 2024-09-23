import type { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

import { ENV_VARIABLES } from './env.config';

export const jwtConstants = {
  secret: ENV_VARIABLES.JWT_SECRET,
  expiresIn: ENV_VARIABLES.JWT_EXPIRES_IN,
  audience: ENV_VARIABLES.JWT_AUDIENCE,
  issuer: ENV_VARIABLES.JWT_ISSUER,
} satisfies JwtSignOptions | JwtVerifyOptions;
