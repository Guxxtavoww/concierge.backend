import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('ikut-backend')
  .setVersion('0.0.1')
  .addTag('auth')
  .addTag('user')
  .addTag('politician')
  .addTag('vote')
  .addBearerAuth()
  .addSecurityRequirements('bearer')
  .build();
