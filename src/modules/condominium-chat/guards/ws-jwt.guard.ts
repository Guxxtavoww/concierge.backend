import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

import { accessTokenConfig } from 'src/config/jwt.config';
import { DECODED_TOKEN_KEY } from 'src/shared/decorators/decoded-token.decorator';

@Injectable()
export class WsJwtGuard {
  constructor(private readonly jwtService: JwtService) {}

  async auth(client: Socket): Promise<DecodedTokenType> {
    const token = this.getTokenFromHandshake(client);

    if (!token) return client.disconnect(true) as any;

    try {
      const decoded = await this.jwtService.verifyAsync<DecodedTokenType>(
        token,
        accessTokenConfig,
      );

      client.data[DECODED_TOKEN_KEY] = decoded;

      return decoded;
    } catch (error) {
      return client.disconnect(true) as any;
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
