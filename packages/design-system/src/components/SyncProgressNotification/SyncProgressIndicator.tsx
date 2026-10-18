import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { cn } from '../../lib/cn';
import { Spinner } from '../Spinner';
import { IconSwap } from '../Transitions';

export type SyncIndicatorState = 'loading' | 'success' | 'warning';

export interface SyncProgressIndicatorProps {
  state: SyncIndicatorState;
  className?: string;
}

/**
 * The leading glyph: a quiet spinner while any task is in flight, then a
 * restrained success / warning icon once every task has settled. Swaps in place
 * with a scale + blur cross-fade. Sized to the heading's optical line so it
 * reads as a peer, not a badge.
 */
export function SyncProgressIndicator({ state, className }: SyncProgressIndicatorProps) {
  return (
    <IconSwap
      value={state}
      className={cn('size-5 shrink-0 place-items-center [&_svg]:size-5', className)}
      items={[
        { key: 'loading', node: <Spinner className="size-5 text-text-muted" /> },
        { key: 'success', node: <CheckCircleIcon className="size-5 text-success" /> },
        { key: 'warning', node: <ExclamationTriangleIcon className="size-5 text-warning" /> },
      ]}
    />
  );
}