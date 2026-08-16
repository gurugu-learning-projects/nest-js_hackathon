import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';
import type { UserPublicProfile } from './users.types.js';

describe('UsersService', () => {
  let service: UsersService;

  const prisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    prisma.user.findMany.mockReset();
    prisma.user.findUnique.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findAll', () => {
    it('returns every public user profile', async () => {
      const users: UserPublicProfile[] = [
        {
          id: 'user-1',
          email: 'one@example.com',
          name: 'One',
          role: 'ADMIN',
        },
        {
          id: 'user-2',
          email: 'two@example.com',
          name: 'Two',
          role: 'PARTICIPANT',
        },
      ];

      prisma.user.findMany.mockResolvedValue(users);

      await expect(service.findAll()).resolves.toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('returns the matching public user profile', async () => {
      const user: UserPublicProfile = {
        id: 'user-1',
        email: 'one@example.com',
        name: 'One',
        role: 'PARTICIPANT',
      };

      prisma.user.findUnique.mockResolvedValue(user);

      await expect(service.findById('user-1')).resolves.toEqual(user);
    });

    it('throws NotFoundException when the user is missing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
