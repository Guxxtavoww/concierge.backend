import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

import { LogService } from 'src/lib/log/log.service';
import { accessTokenConfig } from 'src/config/jwt.config';
import { DECODED_TOKEN_KEY } from 'src/shared/decorators/decoded-token.decorator';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {
    logService.logger?.debug('Guard Contructed');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logService.logger?.debug('Can Activate Method invoked');

    const client: Socket = context.switchToWs().getClient();
    const token = this.getTokenFromHandshake(client);

    if (!token) return false;

    try {
      const decoded = await this.jwtService.verifyAsync<DecodedTokenType>(
        token,
        accessTokenConfig,
      );

      client.data[DECODED_TOKEN_KEY] = decoded;

      return true;
    } catch (error) {
      return false;
    }
  }

  private getTokenFromHandshake(client: Socket): Maybe<string> {
    const token =
      'token' in client.handshake.auth
        ? String(client.handshake.auth.token)
        : undefined;

    return token;
  }
}
