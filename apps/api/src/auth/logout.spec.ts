import { describe, expect, it } from 'vitest';
import { buildEndSessionUrl } from './logout';

describe('buildEndSessionUrl', () => {
  const endpoint = 'https://idp.test/oauth2/logout';

  it('includes client_id and post_logout_redirect_uri', () => {
    const url = new URL(
      buildEndSessionUrl(endpoint, {
        clientId: 'client-1',
        postLogoutRedirectUri: 'http://localhost:3100/auth/logged-out',
      }),
    );
    expect(url.origin + url.pathname).toBe(endpoint);
    expect(url.searchParams.get('client_id')).toBe('client-1');
    expect(url.searchParams.get('post_logout_redirect_uri')).toBe(
      'http://localhost:3100/auth/logged-out',
    );
    expect(url.searchParams.has('id_token_hint')).toBe(false);
  });

  it('adds id_token_hint when available', () => {
    const url = new URL(
      buildEndSessionUrl(endpoint, {
        clientId: 'client-1',
        postLogoutRedirectUri: 'http://app',
        idTokenHint: 'header.payload.sig',
      }),
    );
    expect(url.searchParams.get('id_token_hint')).toBe('header.payload.sig');
  });
});
