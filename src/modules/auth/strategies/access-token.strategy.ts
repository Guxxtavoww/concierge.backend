import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ENV_VARIABLES } from 'src/config/env.config';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ENV_VARIABLES.JWT_SECRET,
    });
  }

  async validate(payload: IJwtPayload) {
    return {
      user_id: payload.id,
    };
  }
}
