import * as fs from 'fs';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';

import { ENV_VARIABLES } from 'src/config/env.config';
import { swaggerConfig } from 'src/config/swagger.config';
import { DataBaseInterceptor } from 'src/lib/http-exceptions/errors/interceptors/database.interceptor';
import { NotFoundInterceptor } from 'src/lib/http-exceptions/errors/interceptors/not-found.interceptor';
import { BadRequestInterceptor } from 'src/lib/http-exceptions/errors/interceptors/bad-request.interceptor';
import { UnauthorizedInterceptor } from 'src/lib/http-exceptions/errors/interceptors/unauthorized.interceptor';
import { DataSourceInterceptor } from 'src/lib/http-exceptions/errors/interceptors/conctionDataSource.interceptor';

import { AppModule } from './app.module';
import { allowedDomains } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  try {
    app.enableCors({
      origin: allowedDomains,
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

    /**
     * -----------------------------------------------------------------------------
     * Swagger
     * -----------------------------------------------------------------------------
     */
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    /**
     * -----------------------------------------------------------------------------
     * Swagger documents
     * -----------------------------------------------------------------------------
     */
    fs.writeFileSync(
      'swagger-document.json',
      JSON.stringify(document, null, 2),
    );

    SwaggerModule.setup('server', app, document);

    await app.listen(ENV_VARIABLES.PORT);
  } catch (err) {
    Logger.debug(JSON.stringify({ err: err.message }, null, 2));
    process.exit(1);
  }
}
bootstrap();
