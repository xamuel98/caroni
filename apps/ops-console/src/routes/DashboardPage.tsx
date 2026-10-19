import { Badge, Card } from '@caroni/design-system';
import { useAbilities, useSession } from '../queries/session';

export function DashboardPage() {
  const session = useSession();
  const abilities = useAbilities();

  const granted = (abilities.data?.results ?? []).flatMap((result) =>
    Object.values(result.actions)
      .filter((action) => action.effect === 'EFFECT_ALLOW')
      .map((action) => ({
        key: action.permissionId,
        label: action.label ?? `${result.resource.module}.${action.permissionId}`,
      })),
  );

  return (
    <div className="p-6">
      <h1 className="font-display text-lg font-medium tracking-tight">Dashboard</h1>
      <p className="mt-1 text-[13px] text-text-secondary">
        Signed in as {session.data?.displayName} · roles {session.data?.roles.join(', ')}
      </p>

      <Card className="mt-5">
        <h2 className="text-sm font-medium text-text">
          Your abilities ({abilities.data?.grants.length ?? 0})
        </h2>
        <p className="mt-1 text-[13px] text-text-secondary">
          Derived from your roles via the policy catalogue, grouped by resource.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {granted.map((ability) => (
            <Badge key={ability.key}>{ability.label}</Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
