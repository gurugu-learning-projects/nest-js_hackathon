import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  AllowAnonymous,
  AuthGuard,
  Roles,
  Session,
} from '@thallesp/nestjs-better-auth';

import type { Session as AuthSession } from '../../auth/auth.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { CreateHackathonDto } from './dto/create-hackathon.dto.js';
import { UpdateHackathonDto } from './dto/update-hackathon.dto.js';
import { HackathonService } from './hackathon.service.js';
import type { HackathonRecord } from './hackathon.types.js';

@Controller('hackathon')
@UseGuards(AuthGuard)
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @Post()
  @Roles(['ADMIN'])
  @ResponseMessage('Hackathon created')
  create(
    @Session() session: AuthSession,
    @Body() dto: CreateHackathonDto,
  ): Promise<HackathonRecord> {
    return this.hackathonService.create(session.user.id, dto);
  }

  @Get()
  @AllowAnonymous()
  findAll(): Promise<HackathonRecord[]> {
    return this.hackathonService.findAll();
  }

  @Get(':id')
  @AllowAnonymous()
  findById(@Param('id') id: string): Promise<HackathonRecord> {
    return this.hackathonService.findById(id);
  }

  @Patch(':id')
  @Roles(['ADMIN'])
  @ResponseMessage('Hackathon updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHackathonDto,
  ): Promise<HackathonRecord> {
    return this.hackathonService.update(id, dto);
  }

  @Delete(':id')
  @Roles(['ADMIN'])
  @ResponseMessage('Hackathon deleted')
  remove(@Param('id') id: string): Promise<HackathonRecord> {
    return this.hackathonService.remove(id);
  }
}
