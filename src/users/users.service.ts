import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { USER_PUBLIC_SELECT, type UserPublicProfile } from './users.types.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<UserPublicProfile[]> {
    return this.prisma.user.findMany({
      select: USER_PUBLIC_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string): Promise<UserPublicProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
