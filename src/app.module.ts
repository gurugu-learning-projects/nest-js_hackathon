import { Module } from '@nestjs/common';
import { ArcjetSecurityModule } from './arcjet/arcjet.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [ArcjetSecurityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
