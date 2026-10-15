import { Badge, Button, Card } from '@caroni/design-system';

export function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">Caroni · Operations</h1>
          <Badge variant="accent">Maker-checker</Badge>
        </header>
        <Card>
          <h2 className="text-sm font-medium text-text-secondary">KYC queue</h2>
          <p className="mt-1 text-[13px] text-text-secondary">Scaffold only — wired in M3.</p>
          <div className="mt-4 flex gap-2">
            <Button size="sm">Review</Button>
            <Button size="sm" variant="secondary">
              Escalate
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
