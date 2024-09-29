import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

import { accessTokenConfig } from 'src/config/jwt.config';
import { DECODED_TOKEN_KEY } from 'src/shared/decorators/decoded-token.decorator';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') return true;

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
    const queryToken = client.handshake?.query?.token;
    const authHeader = client.handshake?.headers?.authorization;

    console.log({ queryToken, authHeader });

    if (authHeader && authHeader.startsWith('Bearer '))
      return authHeader.split(' ')[1];

    if (queryToken && !Array.isArray(queryToken)) return queryToken;

    return null;
  }
}
