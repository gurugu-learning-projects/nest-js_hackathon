import { Controller, Get, HttpCode, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { ResponseMessage } from '../decorators/response-message.decorator.js';
import { ResponseInterceptor } from './response.interceptor.js';

@Controller('demo')
class DemoController {
  @Get('default')
  getDefault() {
    return { id: '1' };
  }

  @Get('custom')
  @ResponseMessage('Users fetched')
  getCustom() {
    return [{ id: '1' }];
  }

  @Get('created')
  @HttpCode(201)
  @ResponseMessage('User created')
  getCreated() {
    return { id: '2' };
  }
}

describe('ResponseInterceptor', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemoController],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('wraps the body with statusCode, default Success message, and data', async () => {
    const response = await request(app.getHttpServer())
      .get('/demo/default')
      .expect(200);

    expect(response.body).toEqual({
      statusCode: 200,
      message: 'Success',
      data: { id: '1' },
    });
  });

  it('uses @ResponseMessage for the message', async () => {
    const response = await request(app.getHttpServer())
      .get('/demo/custom')
      .expect(200);

    expect(response.body).toEqual({
      statusCode: 200,
      message: 'Users fetched',
      data: [{ id: '1' }],
    });
  });

  it('uses the handler HTTP status as statusCode', async () => {
    const response = await request(app.getHttpServer())
      .get('/demo/created')
      .expect(201);

    expect(response.body).toEqual({
      statusCode: 201,
      message: 'User created',
      data: { id: '2' },
    });
  });
});
