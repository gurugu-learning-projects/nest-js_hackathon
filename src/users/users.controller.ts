import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard, Roles, Session } from '@thallesp/nestjs-better-auth';

import type { Session as AuthSession } from '../auth/auth.js';
import { UsersService } from './users.service.js';
import type { UserPublicProfile } from './users.types.js';

@Controller(['user', 'users'])
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Session() session: AuthSession) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };
  }

  @Get('all')
  @Roles(['ADMIN'])
  findAll(): Promise<UserPublicProfile[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<UserPublicProfile> {
    return this.usersService.findById(id);
  }
}
