/** Kicks off the backend OIDC flow; the API redirects back to the app when done. */
export function signIn(returnTo: string = window.location.pathname): void {
  window.location.assign(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
}
