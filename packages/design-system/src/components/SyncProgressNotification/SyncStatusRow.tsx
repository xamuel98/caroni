import { cn } from '../../lib/cn';
import { SyncStatusLabel } from './SyncStatusLabel';
import type { SyncStatus } from './types';

export interface SyncStatusRowProps {
  label: string;
  status: SyncStatus;
  className?: string;
}

/** One two-column status line: channel name left, animated status right. */
export function SyncStatusRow({ label, status, className }: SyncStatusRowProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-1.5', className)}>
      <span className="min-w-0 truncate text-[12.5px] font-medium text-white">{label}</span>
      <SyncStatusLabel status={status} />
    </div>
  );
}