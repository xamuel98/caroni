import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { cn } from '../../lib/cn';
import { TextSwap } from '../Transitions';
import type { SyncStatus } from './types';

const LABELS: Record<SyncStatus, string> = {
  queued: 'Queued',
  loading: 'Loading',
  done: 'Done',
  failed: 'Failed',
};

/** Resting colour per status. `loading` defers to the shimmer's own gradient. */
const TONE: Record<SyncStatus, string> = {
  queued: 'text-white/40',
  loading: '',
  done: 'text-white/65',
  failed: 'text-amber-300',
};

const labelClass = (status: SyncStatus) =>
  status === 'loading' ? 'c-shimmer' : TONE[status];

/** Only `failed` carries a glyph — the caution icon sits tight to the word. */
function LabelContent({ status }: { status: SyncStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {status === 'failed' && (
        <ExclamationTriangleIcon
          className="size-3.5 shrink-0 text-amber-300"
          aria-hidden="true"
        />
      )}
      <span className={labelClass(status)}>{LABELS[status]}</span>
    </span>
  );
}

export interface SyncStatusLabelProps {
  status: SyncStatus;
  className?: string;
}

/**
 * The status word, with two deliberate micro-interactions:
 *
 * - `loading` runs a clipped, sweeping gradient shimmer (pauses under
 *   reduced motion).
 * - every change is a "text states swap" — the old word exits up with blur,
 *   the new one enters from below and sharpens (single element, so the two
 *   never overlap). The caution icon rides in with the `failed` label.
 */
export function SyncStatusLabel({ status, className }: SyncStatusLabelProps) {
  return (
    <TextSwap value={status} className={cn('text-[12.5px] leading-none', className)}>
      <LabelContent status={status} />
    </TextSwap>
  );
}