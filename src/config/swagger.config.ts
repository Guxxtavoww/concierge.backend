import { DocumentBuilder } from '@nestjs/swagger';

import { version } from '../../package.json';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('ikut-backend')
  .setVersion(version)
  .addTag('auth')
  .addTag('user')
  .addTag('schedule')
  .addTag('schedule-invite')
  .addTag('health')
  .addTag('condominium')
  .addTag('condominium-member')
  .addTag('profession')
  .addTag('profession-category')
  .addBearerAuth()
  .addSecurityRequirements('bearer')
  .build();
