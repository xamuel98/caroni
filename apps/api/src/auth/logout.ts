export interface EndSessionParams {
  clientId: string;
  postLogoutRedirectUri: string;
  idTokenHint?: string;
}

/**
 * Builds the OIDC RP-initiated logout URL (end_session_endpoint), which also
 * ends the IdP's SSO session — without this, the app would immediately sign the
 * user back in via SSO.
 */
export function buildEndSessionUrl(endpoint: string, params: EndSessionParams): string {
  const url = new URL(endpoint);
  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('post_logout_redirect_uri', params.postLogoutRedirectUri);
  if (params.idTokenHint) url.searchParams.set('id_token_hint', params.idTokenHint);
  return url.toString();
}
