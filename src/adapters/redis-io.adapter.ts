import { createAdapter } from '@socket.io/redis-adapter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';
import { createClient } from 'redis';

import { ENV_VARIABLES } from 'src/config/env.config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  private getRedisURL() {
    return `redis://${ENV_VARIABLES.REDIS_HOST}:${ENV_VARIABLES.WEBS0CKET_REDIS_PORT}`;
  }

  async connectToRedis() {
    const pubClient = createClient({
      url: this.getRedisURL(),
    });

    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);

    server.adapter(this.adapterConstructor);

    return server;
  }
}
