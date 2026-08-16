import { NestFactory, Reflector } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { env, validateEnv } from './config/env.js';

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));

  await app.listen(env.port);
}
void bootstrap();
