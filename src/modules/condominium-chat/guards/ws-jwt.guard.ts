import {
  Injectable,
  UseGuards,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

import { LogService } from 'src/lib/log/log.service';
import { accessTokenConfig } from 'src/config/jwt.config';
import { DECODED_TOKEN_KEY } from 'src/shared/decorators/decoded-token.decorator';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.getTokenFromHandshake(client);

    if (!token) {
      this.logService.logger?.warn('No token found in WebSocket handshake');

      return false;
    }

    try {
      const decoded = await this.jwtService.verifyAsync<DecodedTokenType>(
        token,
        accessTokenConfig,
      );

      client.data[DECODED_TOKEN_KEY] = decoded;

      return true;
    } catch (error) {
      this.logService.logger?.warn(error);

      return false;
    }
  }

  private getTokenFromHandshake(client: Socket): Maybe<string> {
    const queryToken = client.handshake?.query?.token;
    const authHeader = client.handshake?.headers?.authorization;

    if (authHeader && authHeader.startsWith('Bearer '))
      return authHeader.split(' ')[1];

    if (queryToken && !Array.isArray(queryToken)) return queryToken;

    return null;
  }
}

export function UseWsJwtGuard() {
  return UseGuards(WsJwtGuard);
}
