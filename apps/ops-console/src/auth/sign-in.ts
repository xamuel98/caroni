/** Kicks off the backend OIDC flow; the API redirects back to the app when done. */
export function signIn(returnTo: string = window.location.pathname): void {
  window.location.assign(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
}

/**
 * True while the app is intentionally showing a sign-in error or signed-out
 * screen — in that state we must NOT auto-redirect (it would loop).
 */
export function isAuthScreenPending(search: string = window.location.search): boolean {
  const params = new URLSearchParams(search);
  return params.has('signed_out') || params.has('error');
}

/** Signs in on an auth failure unless we're already on an auth screen. */
export function redirectToSignIn(returnTo: string = window.location.pathname): void {
  if (isAuthScreenPending()) return;
  signIn(returnTo);
}
