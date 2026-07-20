import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { env, validateEnv } from './config/env.js';

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);
  await app.listen(env.port);
}
void bootstrap();
