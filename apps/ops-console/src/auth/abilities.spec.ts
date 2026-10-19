import { describe, expect, it } from 'vitest';
import { hasGrant } from './abilities';

describe('hasGrant', () => {
  it('is true when the permission is granted', () => {
    expect(
      hasGrant(['ops_kyc.kyc_case.view', 'ops_kyc.kyc_case.decide'], 'ops_kyc.kyc_case.view'),
    ).toBe(true);
  });

  it('is false when the permission is absent', () => {
    expect(hasGrant(['ops_kyc.kyc_case.view'], 'ops_transfers.transfer.reverse')).toBe(false);
  });

  it('is false for an empty grant list', () => {
    expect(hasGrant([], 'ops_kyc.kyc_case.view')).toBe(false);
  });
});
