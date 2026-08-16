import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationError } from 'class-validator';

import { AppModule } from './app.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { env, validateEnv } from './config/env.js';

type ValidationErrorItem = {
  property: string;
  message: string;
};

function mapValidationErrors(
  errors: ValidationError[],
  parentPath?: string,
): ValidationErrorItem[] {
  return errors.flatMap((error) => {
    const property = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    const current = Object.values(error.constraints ?? {}).map((message) => ({
      property,
      message,
    }));

    const nested = error.children?.length
      ? mapValidationErrors(error.children, property)
      : [];

    return [...current, ...nested];
  });
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException(mapValidationErrors(errors));
      },
    }),
  );

  await app.listen(env.port);
}
void bootstrap();
