import { Button, Card } from '@caroni/design-system';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="p-6">
      <Card>
        <h1 className="text-sm font-medium text-text">Page not found</h1>
        <p className="mt-1 text-[13px] text-text-secondary">
          That route doesn’t exist in the ops console.
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
