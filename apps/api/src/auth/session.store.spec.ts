import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InMemorySessionStore } from './session.store';

describe('InMemorySessionStore', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('creates and reads back a session', async () => {
    const store = new InMemorySessionStore();
    const session = await store.create({
      userId: 'u1',
      displayName: 'Ada',
      roles: ['ops:kyc_analyst'],
      ttlSeconds: 60,
    });

    expect(await store.get(session.id)).toMatchObject({
      userId: 'u1',
      displayName: 'Ada',
      roles: ['ops:kyc_analyst'],
    });
  });

  it('returns null once a session has expired', async () => {
    const store = new InMemorySessionStore();
    const session = await store.create({
      userId: 'u1',
      displayName: 'Ada',
      roles: [],
      ttlSeconds: 60,
    });

    vi.advanceTimersByTime(61_000);
    expect(await store.get(session.id)).toBeNull();
  });

  it('deletes only the target user’s sessions', async () => {
    const store = new InMemorySessionStore();
    await store.create({ userId: 'u1', displayName: 'Ada', roles: [], ttlSeconds: 60 });
    await store.create({ userId: 'u1', displayName: 'Ada', roles: [], ttlSeconds: 60 });
    const other = await store.create({
      userId: 'u2',
      displayName: 'Bob',
      roles: [],
      ttlSeconds: 60,
    });

    await store.deleteForUser('u1');
    expect(await store.get(other.id)).not.toBeNull();
  });

  it('purges expired sessions in bulk', async () => {
    const store = new InMemorySessionStore();
    await store.create({ userId: 'u1', displayName: 'Ada', roles: [], ttlSeconds: 60 });
    vi.advanceTimersByTime(61_000);
    expect(await store.purgeExpired()).toBe(1);
  });
});
