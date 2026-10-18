import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AbilitiesService, type AbilitiesPayload } from '../authorization/abilities.service';
import { AuthService } from './auth.service';

/** Identity and abilities of the current session. Never returns the session bearer id. */
@Controller('api/session')
export class SessionController {
  constructor(
    private readonly auth: AuthService,
    private readonly abilities: AbilitiesService,
  ) {}

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

  /** Catalogue entries + grants the caller's roles hold (drives UI visibility). */
  @Get('abilities')
  async abilitiesForSession(@Req() req: Request): Promise<AbilitiesPayload> {
    const session = await this.auth.requireSession(req.headers.cookie);
    return this.abilities.forRoles(session.roles);
  }
}
