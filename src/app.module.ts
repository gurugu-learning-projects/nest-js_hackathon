import { Module } from '@nestjs/common';
import { ArcjetSecurityModule } from './arcjet/arcjet.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [ArcjetSecurityModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
