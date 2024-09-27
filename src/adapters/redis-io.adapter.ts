import { createAdapter } from '@socket.io/redis-adapter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';
import { Logger } from '@nestjs/common';
import { createClient } from 'redis';

import { ENV_VARIABLES } from 'src/config/env.config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly REDIS_URL = `redis://${ENV_VARIABLES.REDIS_HOST}:${ENV_VARIABLES.WEBS0CKET_REDIS_PORT}`;

  async connectToRedis() {
    const pubClient = createClient({
      url: this.REDIS_URL,
    });

    const subClient = pubClient.duplicate();

    Logger.log('Connecting to Redis:', this.REDIS_URL);

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);

    server.adapter(this.adapterConstructor);

    return server;
  }
}
