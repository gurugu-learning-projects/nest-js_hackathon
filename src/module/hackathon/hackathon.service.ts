import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateHackathonDto } from './dto/create-hackathon.dto.js';
import { UpdateHackathonDto } from './dto/update-hackathon.dto.js';
import type {
  HackathonParticipantRecord,
  HackathonRecord,
} from './hackathon.types.js';

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

@Injectable()
export class HackathonService {
  constructor(private readonly prisma: PrismaService) {}

  create(authorId: string, dto: CreateHackathonDto): Promise<HackathonRecord> {
    return this.prisma.hackathon.create({
      data: {
        name: dto.name,
        description: dto.description,
        startDate: dto.startDate,
        endDate: dto.endDate,
        isActive: dto.isActive,
        authorId,
      },
    });
  }

  findAll(): Promise<HackathonRecord[]> {
    return this.prisma.hackathon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<HackathonRecord> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
    });

    if (!hackathon) {
      throw new NotFoundException('Hackathon not found');
    }

    return hackathon;
  }

  async update(id: string, dto: UpdateHackathonDto): Promise<HackathonRecord> {
    const existing = await this.findById(id);

    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }

    return this.prisma.hackathon.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        startDate: dto.startDate,
        endDate: dto.endDate,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string): Promise<HackathonRecord> {
    await this.findById(id);

    return this.prisma.hackathon.delete({
      where: { id },
    });
  }

  async join(
    hackathonId: string,
    userId: string,
  ): Promise<HackathonParticipantRecord> {
    const hackathon = await this.findById(hackathonId);

    if (!hackathon.isActive) {
      throw new BadRequestException('Hackathon is not active');
    }

    if (hackathon.endDate <= new Date()) {
      throw new BadRequestException('Hackathon has ended');
    }

    try {
      return await this.prisma.hackathonParticipant.create({
        data: {
          hackathonId,
          userId,
        },
      });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new BadRequestException('Already joined this hackathon');
      }

      throw error;
    }
  }
}
