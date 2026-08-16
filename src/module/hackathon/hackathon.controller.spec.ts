import { Test, TestingModule } from '@nestjs/testing';

import { HackathonController } from './hackathon.controller.js';
import { HackathonService } from './hackathon.service.js';

describe('HackathonController', () => {
  let controller: HackathonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonController],
      providers: [HackathonService],
    }).compile();

    controller = module.get<HackathonController>(HackathonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
