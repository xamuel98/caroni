import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import type { AuthService } from '../auth/auth.service';
import type { SessionRecord } from '../auth/session.store';
import { ForbiddenError, UnauthorizedError } from '../common/errors';
import { AuthorizationGuard, type AuthedRequest } from './authorization.guard';
import type { PolicyService } from './policy.service';

const session: SessionRecord = {
  id: 'sid',
  userId: 'u1',
  displayName: 'Ada',
  roles: ['ops:kyc_analyst'],
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 60_000),
};

function build(overrides: { permission?: string; decision?: unknown } = {}) {
  const reflector = {
    getAllAndOverride: vi.fn().mockReturnValue(overrides.permission),
  } as unknown as Reflector;
  const policy = {
    decide: vi
      .fn()
      .mockResolvedValue(
        overrides.decision ?? { allow: true, reasons: [], obligations: [], matchedPolicy: 'p' },
      ),
  } as unknown as PolicyService;
  const auth = { requireSession: vi.fn().mockResolvedValue(session) } as unknown as AuthService;
  const guard = new AuthorizationGuard(reflector, policy, auth);

  const request = { headers: { cookie: 'caroni_sid=sid' }, params: {} } as AuthedRequest;
  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  return { guard, policy, auth, request, context };
}

describe('AuthorizationGuard', () => {
  it('allows routes that declare no permission', async () => {
    const { guard, policy, context } = build();
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(policy.decide).not.toHaveBeenCalled();
  });

  it('allows and attaches the session when policy permits', async () => {
    const { guard, policy, request, context } = build({ permission: 'ops_kyc.kyc_case.view' });
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.session).toBe(session);
    expect(policy.decide).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ops_kyc.kyc_case.view',
        subject: { id: 'u1', roles: ['ops:kyc_analyst'] },
      }),
    );
  });

  it('denies with reasons and obligations when policy rejects', async () => {
    const { guard, context } = build({
      permission: 'ops_transfers.transfer.reverse',
      decision: {
        allow: false,
        reasons: ['rbac.denied'],
        obligations: ['requires_supervisor_approval'],
        matchedPolicy: 'p',
      },
    });

    await expect(guard.canActivate(context)).rejects.toMatchObject({
      status: 403,
      extensions: {
        reasons: ['rbac.denied'],
        obligations: ['requires_supervisor_approval'],
      },
    });
  });

  it('requires a session before consulting policy', async () => {
    const { guard, policy, auth, context } = build({ permission: 'ops_kyc.kyc_case.view' });
    (auth.requireSession as ReturnType<typeof vi.fn>).mockRejectedValue(new UnauthorizedError());

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(policy.decide).not.toHaveBeenCalled();
  });

  it('exposes a typed ForbiddenError', async () => {
    const { guard, context } = build({
      permission: 'x',
      decision: { allow: false, reasons: ['nope'], obligations: [], matchedPolicy: '' },
    });
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ForbiddenError);
  });
});
