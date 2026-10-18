import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, InputText } from '@caroni/design-system';

function Swatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-12 w-full rounded-md border border-border" style={{ background: value }} />
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

export function App() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-bg p-8 text-text">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">Caroni · design tokens</h1>
            <p className="text-sm text-text-secondary">
              Brand palette · Inter + tabular figures · Emil motion rules
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setDark((d) => !d)}>
            {dark ? 'Light' : 'Dark'}
          </Button>
        </header>

        <Card className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-text-secondary">Approval required</h2>
              <p className="mt-1 text-[13px] text-text-secondary">
                Transfer to <b className="text-text">@ada</b> held pending KYC
              </p>
            </div>
            <Badge variant="warning">Pending</Badge>
          </div>
          <div className="tnum font-display text-3xl font-light tracking-tight">₦250,000.00</div>
          <div className="flex gap-2">
            <Button startIcon={<CheckIcon className="size-4" />}>Approve</Button>
            <Button variant="secondary">Decline</Button>
            <Button variant="ghost" endIcon={<ArrowRightIcon className="size-4" />}>
              View details
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InputText placeholder="Search @tag" />
          <InputText placeholder="Amount" inputMode="decimal" />
          <InputText placeholder="Note" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Completed</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="danger">Failed</Badge>
          <Badge variant="info">In review</Badge>
          <Badge variant="accent">New</Badge>
          <Badge>Draft</Badge>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-text-secondary">Tokens</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Swatch label="bg" value="var(--color-bg)" />
            <Swatch label="surface" value="var(--color-surface)" />
            <Swatch label="border" value="var(--color-border)" />
            <Swatch label="sunken" value="var(--color-surface-sunken)" />
            <Swatch label="text" value="var(--color-text)" />
            <Swatch label="muted" value="var(--color-text-muted)" />
            <Swatch label="accent" value="var(--color-accent)" />
            <Swatch label="accent-soft" value="var(--color-accent-soft)" />
          </div>
        </div>
      </div>
    </div>
  );
}
