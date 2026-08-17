import { jest } from '@jest/globals';
import { CanActivate } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

import type { Session as AuthSession } from '../../auth/auth.js';
import { HackathonController } from './hackathon.controller.js';
import { HackathonService } from './hackathon.service.js';
import type {
  HackathonParticipantRecord,
  HackathonRecord,
} from './hackathon.types.js';

describe('HackathonController', () => {
  let controller: HackathonController;

  const hackathonService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    join: jest.fn(),
  };

  const hackathon: HackathonRecord = {
    id: 'hack-1',
    name: 'Spring Hack',
    description: 'Build something useful',
    startDate: new Date('2026-09-01T00:00:00.000Z'),
    endDate: new Date('2026-09-08T00:00:00.000Z'),
    isActive: true,
    authorId: 'admin-1',
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    hackathonService.create.mockReset();
    hackathonService.findAll.mockReset();
    hackathonService.findById.mockReset();
    hackathonService.update.mockReset();
    hackathonService.remove.mockReset();
    hackathonService.join.mockReset();

    const allow: CanActivate = { canActivate: () => true };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonController],
      providers: [{ provide: HackathonService, useValue: hackathonService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(allow)
      .compile();

    controller = module.get(HackathonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the session user id as author id on create', async () => {
    hackathonService.create.mockResolvedValue(hackathon);

    const dto = {
      name: 'Spring Hack',
      startDate: hackathon.startDate,
      endDate: hackathon.endDate,
    };

    const session = {
      user: { id: 'admin-1' },
    } as AuthSession;

    await expect(controller.create(session, dto)).resolves.toEqual(hackathon);
    expect(hackathonService.create).toHaveBeenCalledWith('admin-1', dto);
  });

  it('passes the hackathon id and session user id on join', async () => {
    const participant: HackathonParticipantRecord = {
      id: 'part-1',
      hackathonId: 'hack-1',
      userId: 'user-1',
      createdAt: new Date('2026-08-17T00:00:00.000Z'),
      updatedAt: new Date('2026-08-17T00:00:00.000Z'),
    };

    hackathonService.join.mockResolvedValue(participant);

    const session = {
      user: { id: 'user-1' },
    } as AuthSession;

    await expect(controller.join('hack-1', session)).resolves.toEqual(
      participant,
    );
    expect(hackathonService.join).toHaveBeenCalledWith('hack-1', 'user-1');
  });
});
