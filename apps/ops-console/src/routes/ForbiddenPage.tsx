import { Button, Card } from '@caroni/design-system';
import { Link, useLocation } from 'react-router-dom';

export function ForbiddenPage() {
  const location = useLocation();
  const permission = (location.state as { permission?: string } | null)?.permission;

  return (
    <div className="p-6">
      <Card>
        <h1 className="text-sm font-medium text-text">You don’t have access</h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          Your role lacks
          {permission ? (
            <>
              {' '}
              <code className="text-text">{permission}</code>.
            </>
          ) : (
            ' the required permission.'
          )}
        </p>
        <Link to="/dashboard" className="mt-4 inline-block">
          <Button size="sm" variant="secondary">
            Back to dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}
