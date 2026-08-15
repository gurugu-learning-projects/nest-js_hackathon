import { Controller, Get } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';

import type { Session as AuthSession } from '../auth/auth.js';

@Controller('users')
export class UsersController {
  @Get('me')
  getMe(@Session() session: AuthSession) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };
  }
}
