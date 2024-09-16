import { Injectable, Logger } from '@nestjs/common';

import { ENV_VARIABLES } from 'src/config/env.config';

@Injectable()
export class LogService {
  public logger: Logger | undefined =
    ENV_VARIABLES.ENV === 'dev' ? new Logger(LogService.name) : undefined;
}
