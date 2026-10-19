import { Badge, Button, Card } from '@caroni/design-system';
import { useEffect, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { signIn } from '../auth/sign-in';
import { useCan } from '../auth/useCan';
import { isUnauthorized } from '../lib/api';
import { NAV } from '../lib/nav';
import { useSession } from '../queries/session';
import { PageError, PageLoader } from './States';

/** Authenticated layout: session gate, header, and permission-filtered sidebar. */
export function AppShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const can = useCan();

  // The API bounces failed sign-ins back to the app with ?error=… so we can
  // explain what happened instead of immediately retrying (which would loop).
  const params = new URLSearchParams(window.location.search);
  const signInError = params.get('error');
  const signInReason = params.get('reason');
  const unauthorized = isUnauthorized(session.error);

  useEffect(() => {
    if (unauthorized && !signInError) signIn();
  }, [unauthorized, signInError]);

  if (unauthorized && signInError) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg p-6">
        <Card className="w-full max-w-md">
          <h1 className="text-sm font-medium text-text">Sign-in failed</h1>
          <p className="mt-1 text-[13px] text-text-secondary">
            {signInReason ?? 'The identity provider did not complete the sign-in.'}
          </p>
          <Button className="mt-4" size="sm" onClick={() => signIn()}>
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  if (unauthorized) return <PageLoader label="Redirecting to sign in..." />;
  if (session.isPending) return <PageLoader label="Signing in..." />;
  if (session.error) return <PageError error={session.error} onRetry={() => session.refetch()} />;

  const items = NAV.filter((item) => can(item.permission));

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-[15px] font-medium tracking-tight">
            Caroni · Operations
          </span>
          <Badge variant="accent">Maker-checker</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-text-secondary">{session.data?.displayName}</span>
          <form method="post" action="/auth/logout">
            <Button size="sm" variant="secondary" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <div className="flex">
        <nav className="w-56 shrink-0 border-r border-border p-4">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-[13px] transition-colors ${
                      isActive ? 'bg-surface text-text' : 'text-text-secondary hover:text-text'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
