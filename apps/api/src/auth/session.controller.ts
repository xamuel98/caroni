import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';

/** Identity of the current session. Never returns the session bearer id. */
@Controller('api/session')
export class SessionController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  async current(@Req() req: Request) {
    const session = await this.auth.requireSession(req.headers.cookie);
    return {
      userId: session.userId,
      displayName: session.displayName,
      email: session.email,
      roles: session.roles,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
    };
  }
}
