import { DocumentBuilder } from '@nestjs/swagger';

import { version, name } from '../../package.json';

export const swaggerConfig = new DocumentBuilder()
  .setTitle(name)
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
