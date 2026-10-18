/** The lifecycle of a single synchronization task. */
export type SyncStatus = 'queued' | 'loading' | 'done' | 'failed';

export interface SyncTask {
  /** Stable identity — keeps row positions stable as statuses change. */
  id: string;
  /** Human label, e.g. the channel name. */
  label: string;
  status: SyncStatus;
}

export interface SyncCounts {
  total: number;
  done: number;
  failed: number;
  loading: number;
  queued: number;
  /** True once every task has reached a terminal state (`done` | `failed`). */
  finished: boolean;
}

/** Derive the tallies that drive the summary and indicator. Never hardcode. */
export function getSyncCounts(tasks: SyncTask[]): SyncCounts {
  const counts: SyncCounts = {
    total: tasks.length,
    done: 0,
    failed: 0,
    loading: 0,
    queued: 0,
    finished: false,
  };

  for (const task of tasks) {
    if (task.status === 'done') counts.done += 1;
    else if (task.status === 'failed') counts.failed += 1;
    else if (task.status === 'loading') counts.loading += 1;
    else counts.queued += 1;
  }

  counts.finished = counts.loading === 0 && counts.queued === 0;
  return counts;
}

export type SyncTone = 'progress' | 'success' | 'attention';

export function getSyncTone(counts: SyncCounts): SyncTone {
  if (!counts.finished) return 'progress';
  return counts.failed > 0 ? 'attention' : 'success';
}

/** Default headings per tone — overridable via the `title` prop. */
export const syncTitles: Record<SyncTone, string> = {
  progress: 'Syncing ad data',
  success: 'Sync complete',
  attention: 'Sync completed with issues',
};