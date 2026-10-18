import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { PageError, PageLoader } from '../components/States';
import { isUnauthorized } from '../lib/api';
import { useAbilities } from '../queries/session';
import { signIn } from './sign-in';
import { useCan } from './useCan';

/**
 * Route-level guard: blocks a route unless the session holds `permission`.
 * The server still enforces this on the API — this only shapes the UI.
 */
export function RequireAbility({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const { isPending, error } = useAbilities();
  const can = useCan();

  useEffect(() => {
    if (isUnauthorized(error)) signIn();
  }, [error]);

  if (isPending) return <PageLoader />;
  if (error) return <PageError error={error} />;
  if (!can(permission)) return <Navigate to="/forbidden" replace state={{ permission }} />;
  return <>{children}</>;
}
