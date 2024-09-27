import { createAdapter } from '@socket.io/redis-adapter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Injectable, Logger } from '@nestjs/common';
import type { ServerOptions } from 'socket.io';
import { createClient } from 'redis';

import { ENV_VARIABLES } from 'src/config/env.config';
import { corsConfig } from 'src/config/cors.config';

@Injectable()
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly REDIS_URL = `redis://${ENV_VARIABLES.REDIS_HOST}:${ENV_VARIABLES.WEBS0CKET_REDIS_PORT}`;

  async connectToRedis() {
    const pubClient = createClient({
      url: this.REDIS_URL,
    });

    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]).then(
      ([pub, sub]) =>
        Logger.debug('Connecting to Redis:', this.REDIS_URL, { pub, sub }),
    );

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const optionsWithCors = {
      ...options,
      cors: {
        origin: corsConfig.allowedWsDomains,
      },
    };

    const server = super.createIOServer(port, optionsWithCors);

    server.adapter(this.adapterConstructor);

    return server;
  }
}
