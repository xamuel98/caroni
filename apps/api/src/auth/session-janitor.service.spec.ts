import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionJanitor } from './session-janitor.service';
import type { SessionStore } from './session.store';

describe('SessionJanitor', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('purges expired sessions on its interval and stops on destroy', async () => {
    const purgeExpired = vi.fn().mockResolvedValue(2);
    const store = { purgeExpired } as unknown as SessionStore;
    const janitor = new SessionJanitor(store);

    janitor.onModuleInit();
    expect(purgeExpired).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(SessionJanitor.INTERVAL_MS);
    expect(purgeExpired).toHaveBeenCalledTimes(1);

    janitor.onModuleDestroy();
    await vi.advanceTimersByTimeAsync(SessionJanitor.INTERVAL_MS * 3);
    expect(purgeExpired).toHaveBeenCalledTimes(1);
  });

  it('never throws when a purge fails', async () => {
    const purgeExpired = vi.fn().mockRejectedValue(new Error('db down'));
    const store = { purgeExpired } as unknown as SessionStore;
    const janitor = new SessionJanitor(store);

    janitor.onModuleInit();
    // Would reject the test if the failure escaped the janitor.
    await vi.advanceTimersByTimeAsync(SessionJanitor.INTERVAL_MS);
    janitor.onModuleDestroy();

    expect(purgeExpired).toHaveBeenCalledTimes(1);
  });
});
