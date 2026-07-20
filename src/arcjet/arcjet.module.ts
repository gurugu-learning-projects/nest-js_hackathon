import { ArcjetGuard, ArcjetModule, fixedWindow, shield } from '@arcjet/nest';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { env } from '../config/env.js';

@Module({
  imports: [
    ArcjetModule.forRoot({
      isGlobal: true,
      key: env.arcjetKey!,
      rules: [
        shield({ mode: env.arcjetMode }),
        fixedWindow({
          mode: env.arcjetMode,
          window: '1m',
          max: 60,
        }),
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
  ],
})
export class ArcjetSecurityModule {}
