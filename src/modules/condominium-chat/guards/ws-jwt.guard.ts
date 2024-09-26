import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

import { LogService } from 'src/lib/log/log.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake?.query?.token;

    if (!token || Array.isArray(token)) return false;

    try {
      const decoded = await this.jwtService.verifyAsync(token);

      client.data.user = decoded as DecodedTokenType;

      return true;
    } catch (error) {
      this.logService.logger?.warn(error);

      return false;
    }
  }
}
