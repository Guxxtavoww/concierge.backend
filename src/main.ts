import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';
import { ENV_VARIABLES } from './config/env.config';
import { DataBaseInterceptor } from './lib/http-exceptions/errors/interceptors/database.interceptor';
import { NotFoundInterceptor } from './lib/http-exceptions/errors/interceptors/not-found.interceptor';
import { BadRequestInterceptor } from './lib/http-exceptions/errors/interceptors/bad-request.interceptor';
import { UnauthorizedInterceptor } from './lib/http-exceptions/errors/interceptors/unauthorized.interceptor';
import { DataSourceInterceptor } from './lib/http-exceptions/errors/interceptors/conctionDataSource.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  try {
    app.enableCors({
      origin: corsConfig.allowedDomains,
    });
    app.enableShutdownHooks();
    app.setGlobalPrefix('server');

    /**
     * -----------------------------------------------------------------------------
     * HTTP Interceptor
     * -----------------------------------------------------------------------------
     */
    app.useGlobalInterceptors(new UnauthorizedInterceptor());
    app.useGlobalInterceptors(new DataSourceInterceptor());
    app.useGlobalInterceptors(new BadRequestInterceptor());
    app.useGlobalInterceptors(new NotFoundInterceptor());
    app.useGlobalInterceptors(new DataBaseInterceptor());

    if (ENV_VARIABLES.ENV === 'dev') {
      const [{ SwaggerModule }, { swaggerConfig }] = await Promise.all([
        import('@nestjs/swagger'),
        import('./config/swagger.config'),
      ]);

      const document = SwaggerModule.createDocument(app, swaggerConfig);

      fs.writeFileSync(
        'swagger-document.json',
        JSON.stringify(document, null, 2),
      );

      SwaggerModule.setup('server', app, document);
    }

    await app.listen(ENV_VARIABLES.PORT);
  } catch (err) {
    Logger.debug(JSON.stringify({ err: err.message }, null, 2));
    process.exit(1);
  }
}
bootstrap();
