import { Card } from '@caroni/design-system';
import { useQuery } from '@tanstack/react-query';
import { PageError, PageLoader } from '../components/States';
import { apiFetch } from '../lib/api';

interface KycCasesResponse {
  cases: unknown[];
  viewer: string | null;
}

export function KycQueuePage() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['ops', 'kyc', 'cases'],
    queryFn: () => apiFetch<KycCasesResponse>('/api/ops/kyc/cases'),
  });

  if (isPending) return <PageLoader />;
  if (isError) return <PageError error={error} onRetry={() => void refetch()} />;

  const cases = data?.cases ?? [];

  return (
    <div className="p-6">
      <h1 className="font-display text-lg font-medium tracking-tight">KYC queue</h1>
      <p className="mt-1 text-[13px] text-text-secondary">
        Server-enforced by <code className="text-text">ops_kyc.kyc_case.view</code>.
      </p>
      <Card className="mt-5">
        {cases.length === 0 ? (
          <p className="text-[13px] text-text-secondary">No cases awaiting review.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {cases.map((_, index) => (
              <li key={index} className="py-2 text-[13px] text-text">
                Case #{index + 1}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
