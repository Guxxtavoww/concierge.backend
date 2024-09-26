import { createAdapter } from '@socket.io/redis-adapter';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createClient } from 'redis';

import { ENV_VARIABLES } from 'src/config/env.config';

export class RedisIoAdapter extends IoAdapter {
  private redisAdapter: ReturnType<typeof createAdapter>;

  private getRedisURL() {
    return `redis://${ENV_VARIABLES.REDIS_HOST}:${ENV_VARIABLES.REDIS_PORT}`;
  }

  async connectToRedis() {
    const pubClient = createClient({
      password: ENV_VARIABLES.REDIS_PASSWORD,
      url: this.getRedisURL(),
    });

    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.redisAdapter = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);

    server.adapter(this.redisAdapter);

    return server;
  }
}
