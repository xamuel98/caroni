import { describe, expect, it } from 'vitest';
import { resolveRoles } from './roles';

describe('resolveRoles', () => {
  it('uses the token roles when present', () => {
    expect(resolveRoles(['ops:kyc_analyst'], ['ops:admin'], false)).toEqual({
      roles: ['ops:kyc_analyst'],
      usedOverride: false,
    });
  });

  it('applies the dev override when the token has none', () => {
    expect(resolveRoles([], ['ops:kyc_analyst'], false)).toEqual({
      roles: ['ops:kyc_analyst'],
      usedOverride: true,
    });
  });

  it('ignores the override in production', () => {
    expect(resolveRoles([], ['ops:kyc_analyst'], true)).toEqual({
      roles: [],
      usedOverride: false,
    });
  });

  it('returns no roles when there is no token roles and no override', () => {
    expect(resolveRoles([], [], false)).toEqual({ roles: [], usedOverride: false });
  });
});
