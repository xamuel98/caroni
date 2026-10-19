import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, isForbidden, isUnauthorized } from './api';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('apiFetch', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('parses JSON on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ ok: true })));
    await expect(apiFetch<{ ok: boolean }>('/x')).resolves.toEqual({ ok: true });
  });

  it('always sends cookies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);
    await apiFetch('/x');
    expect(fetchMock).toHaveBeenCalledWith(
      '/x',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('maps a problem+json error to ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { code: 'unauthorized', detail: 'Authentication required', status: 401 },
            401,
          ),
        ),
    );
    await expect(apiFetch('/x')).rejects.toMatchObject({
      status: 401,
      code: 'unauthorized',
      message: 'Authentication required',
    });
  });

  it('falls back to http_<status> for a non-JSON error body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 500 })));
    await expect(apiFetch('/x')).rejects.toMatchObject({ status: 500, code: 'http_500' });
  });

  it('classifies auth errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ code: 'unauthorized', status: 401 }, 401)),
    );
    const error = await apiFetch('/x').catch((e: unknown) => e);
    expect(isUnauthorized(error)).toBe(true);
    expect(isForbidden(error)).toBe(false);
  });
});
