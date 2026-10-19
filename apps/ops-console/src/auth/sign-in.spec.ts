import { describe, expect, it } from 'vitest';
import { isAuthScreenPending } from './sign-in';

describe('isAuthScreenPending', () => {
  it('is true on the signed-out screen', () => {
    expect(isAuthScreenPending('?signed_out=1')).toBe(true);
  });

  it('is true on the sign-in error screen', () => {
    expect(isAuthScreenPending('?error=sign_in_failed&reason=nope')).toBe(true);
  });

  it('is false for unrelated query params', () => {
    expect(isAuthScreenPending('?page=2')).toBe(false);
  });

  it('is false when there is no query string', () => {
    expect(isAuthScreenPending('')).toBe(false);
  });
});
