import { Button, Card, Spinner } from '@caroni/design-system';
import { ApiError } from '../lib/api';

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 p-8 text-text-secondary">
      <Spinner />
      <span className="text-[13px]">{label}</span>
    </div>
  );
}

export function PageError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : 'Something went wrong';
  return (
    <Card className="m-8">
      <h2 className="text-sm font-medium text-text">Could not load</h2>
      <p className="mt-1 text-[13px] text-text-secondary">{message}</p>
      {onRetry ? (
        <Button size="sm" variant="secondary" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </Card>
  );
}
