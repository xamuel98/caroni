import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import type { SessionRecord } from '../auth/session.store';
import { correlationId } from '../common/correlation';
import { ForbiddenError } from '../common/errors';
import { PolicyService } from './policy.service';
import { PERMISSION_METADATA } from './require-permission.decorator';

export type AuthedRequest = Request & { session?: SessionRecord };

/**
 * Enforces `@RequirePermission(...)` by asking OPA for a decision with the
 * caller's verified session as the subject. Denies with reasons/obligations.
 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly policy: PolicyService,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<string | undefined>(PERMISSION_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permission) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const session = await this.auth.requireSession(req.headers.cookie);
    req.session = session;

    const decision = await this.policy.decide({
      action: permission,
      subject: { id: session.userId, roles: session.roles },
      resource: resourceFrom(req),
      context: { correlationId: correlationId() },
    });

    if (!decision.allow) {
      throw new ForbiddenError(
        'Permission denied',
        decision.reasons.join('; ') || 'rbac.denied',
        decision.obligations,
      );
    }
    return true;
  }
}

function resourceFrom(req: Request): Record<string, unknown> | undefined {
  const params = req.params as Record<string, string>;
  return Object.keys(params).length > 0 ? { params } : undefined;
}
