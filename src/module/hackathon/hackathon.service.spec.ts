import { jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { HackathonService } from './hackathon.service.js';
import type {
  HackathonParticipantRecord,
  HackathonRecord,
} from './hackathon.types.js';

describe('HackathonService', () => {
  let service: HackathonService;

  const prisma = {
    hackathon: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    hackathonParticipant: {
      create: jest.fn(),
    },
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
    prisma.hackathon.create.mockReset();
    prisma.hackathon.findMany.mockReset();
    prisma.hackathon.findUnique.mockReset();
    prisma.hackathon.update.mockReset();
    prisma.hackathon.delete.mockReset();
    prisma.hackathonParticipant.create.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackathonService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(HackathonService);
  });

  describe('create', () => {
    it('creates a hackathon with the given author id', async () => {
      prisma.hackathon.create.mockResolvedValue(hackathon);

      const dto = {
        name: 'Spring Hack',
        description: 'Build something useful',
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        isActive: true,
      };

      await expect(service.create('admin-1', dto)).resolves.toEqual(hackathon);
      expect(prisma.hackathon.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: dto.description,
          startDate: dto.startDate,
          endDate: dto.endDate,
          isActive: dto.isActive,
          authorId: 'admin-1',
        },
      });
    });
  });

  describe('findAll', () => {
    it('returns every hackathon newest first', async () => {
      prisma.hackathon.findMany.mockResolvedValue([hackathon]);

      await expect(service.findAll()).resolves.toEqual([hackathon]);
      expect(prisma.hackathon.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('returns the matching hackathon', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(hackathon);

      await expect(service.findById('hack-1')).resolves.toEqual(hackathon);
    });

    it('throws NotFoundException when the hackathon is missing', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates the matching hackathon', async () => {
      const updated = { ...hackathon, name: 'Fall Hack' };

      prisma.hackathon.findUnique.mockResolvedValue(hackathon);
      prisma.hackathon.update.mockResolvedValue(updated);

      await expect(
        service.update('hack-1', { name: 'Fall Hack' }),
      ).resolves.toEqual(updated);
    });

    it('throws NotFoundException when the hackathon is missing', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing', { name: 'Fall Hack' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when the merged endDate is not after startDate', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(hackathon);

      await expect(
        service.update('hack-1', {
          endDate: new Date('2026-08-01T00:00:00.000Z'),
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.hackathon.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes the matching hackathon', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(hackathon);
      prisma.hackathon.delete.mockResolvedValue(hackathon);

      await expect(service.remove('hack-1')).resolves.toEqual(hackathon);
      expect(prisma.hackathon.delete).toHaveBeenCalledWith({
        where: { id: 'hack-1' },
      });
    });

    it('throws NotFoundException when the hackathon is missing', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.hackathon.delete).not.toHaveBeenCalled();
    });
  });

  describe('join', () => {
    const participant: HackathonParticipantRecord = {
      id: 'part-1',
      hackathonId: 'hack-1',
      userId: 'user-1',
      createdAt: new Date('2026-08-17T00:00:00.000Z'),
      updatedAt: new Date('2026-08-17T00:00:00.000Z'),
    };

    it('creates a participant when the hackathon is active and open', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(hackathon);
      prisma.hackathonParticipant.create.mockResolvedValue(participant);

      await expect(service.join('hack-1', 'user-1')).resolves.toEqual(
        participant,
      );
      expect(prisma.hackathonParticipant.create).toHaveBeenCalledWith({
        data: {
          hackathonId: 'hack-1',
          userId: 'user-1',
        },
      });
    });

    it('throws NotFoundException when the hackathon is missing', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(null);

      await expect(service.join('missing', 'user-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.hackathonParticipant.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the hackathon is not active', async () => {
      prisma.hackathon.findUnique.mockResolvedValue({
        ...hackathon,
        isActive: false,
      });

      await expect(service.join('hack-1', 'user-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.hackathonParticipant.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the hackathon has ended', async () => {
      prisma.hackathon.findUnique.mockResolvedValue({
        ...hackathon,
        endDate: new Date('2020-01-01T00:00:00.000Z'),
      });

      await expect(service.join('hack-1', 'user-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.hackathonParticipant.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the unique constraint is violated', async () => {
      prisma.hackathon.findUnique.mockResolvedValue(hackathon);
      prisma.hackathonParticipant.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(service.join('hack-1', 'user-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
