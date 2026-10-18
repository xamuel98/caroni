import { XMarkIcon } from '@heroicons/react/20/solid';
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../Button';
import { SyncProgressIndicator, type SyncIndicatorState } from './SyncProgressIndicator';
import { SyncStatusPopover } from './SyncStatusPopover';
import { DigitNumber, TextSwap } from '../Transitions';
import { getSyncCounts, getSyncTone, syncTitles, type SyncCounts, type SyncTask } from './types';

export type SyncNotificationPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * `--dds-sync-dir` flips the enter/exit travel so top notifications drop in
 * from above and bottom ones rise from below — same edge in and out.
 */
const positionClasses: Record<SyncNotificationPosition, string> = {
  'top-left': 'top-4 left-4 [--dds-sync-dir:-1]',
  'top-right': 'top-4 right-4 [--dds-sync-dir:-1]',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
};

export interface SyncProgressNotificationProps {
  /** The tasks being synchronized. Counts and copy are derived from these. */
  tasks: SyncTask[];
  /** Visibility. Omit for an uncontrolled notification that hides on dismiss. */
  open?: boolean;
  /** Called when the user dismisses. Never cancels the actual sync. */
  onDismiss?: () => void;
  /** Overrides the derived heading. */
  title?: ReactNode;
  /** Overrides the derived summary line. */
  subtitle?: ReactNode;
  /** Docked corner. Defaults to `bottom-right`. */
  position?: SyncNotificationPosition;
  /** Show the dismiss control. Defaults to true. */
  dismissible?: boolean;
  /** Show a retry action when any task has failed. Receives the failed ids. */
  onRetry?: (failedIds: string[]) => void;
  /** Retry button label. Defaults to `Retry failed`. */
  retryLabel?: string;
  className?: string;
}

function SyncSubtitle({ counts, tasks }: { counts: SyncCounts; tasks: SyncTask[] }) {
  const { done, total, failed, finished } = counts;
  const failedLabel = tasks.find((task) => task.status === 'failed')?.label;
  const showTail = failed === 0 || finished;
  const tail = finished && failed > 0 ? 'channels completed' : 'channels done';

  return (
    <>
      <DigitNumber value={String(done)} />
      {' of '}
      <DigitNumber value={String(total)} />
      {showTail && ' '}
      {showTail && <TextSwap value={tail}>{tail}</TextSwap>}
      {failed > 0 && (
        <span className="text-warning">
          {' · '}
          {failed === 1 && failedLabel ? (
            <TextSwap value={failedLabel}>{failedLabel}</TextSwap>
          ) : (
            <DigitNumber value={String(failed)} />
          )}
          {' failed'}
        </span>
      )}
    </>
  );
}

/**
 * A floating, data-driven background-sync progress notification. Feed it a list
 * of {@link SyncTask}s and it derives the headline, the summary tally, the
 * leading indicator and the contextual status panel — no hardcoded channels, no
 * fake timers. Dismissal only hides the UI; the sync itself is untouched.
 */
export function SyncProgressNotification({
  tasks,
  open,
  onDismiss,
  title,
  subtitle,
  position = 'bottom-right',
  dismissible = true,
  onRetry,
  retryLabel = 'Retry Failed',
  className,
}: SyncProgressNotificationProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(true);
  const resolvedOpen = isControlled ? open : internalOpen;

  const [mounted, setMounted] = useState(resolvedOpen);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (resolvedOpen) setMounted(true);
  }, [resolvedOpen]);

  // Keep the node mounted through its exit transition, then unmount. A timer
  // backstops the case where `transitionend` never fires (reduced motion).
  useEffect(() => {
    if (resolvedOpen) return;
    setPopoverOpen(false);
    const timer = window.setTimeout(() => setMounted(false), 320);
    return () => window.clearTimeout(timer);
  }, [resolvedOpen]);

  if (!mounted) return null;

  const counts = getSyncCounts(tasks);
  const tone = getSyncTone(counts);
  const heading = title ?? syncTitles[tone];
  const indicatorState: SyncIndicatorState = !counts.finished
    ? 'loading'
    : counts.failed > 0
      ? 'warning'
      : 'success';

  const dismiss = () => {
    if (!isControlled) setInternalOpen(false);
    onDismiss?.();
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== nodeRef.current) return;
    if (!resolvedOpen) setMounted(false);
  };

  return (
    <div
      ref={nodeRef}
      data-state={resolvedOpen ? 'open' : 'closed'}
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        'c-sync-notification fixed z-[70] w-[calc(100vw-2rem)] max-w-[440px]',
        positionClasses[position],
        className,
      )}
    >
      <div
        className={cn(
          'relative flex items-start gap-3 rounded-md border border-border bg-surface-raised p-3.5 pr-11',
          'shadow-[0_12px_32px_-12px_rgb(16_16_20/0.28)]',
          'dark:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.66)]',
        )}
      >
        <SyncProgressIndicator state={indicatorState} className="mt-px" />

        <div className="min-w-0 flex-1" role="status" aria-live="polite">
          <div className="text-[14px] font-medium leading-5 tracking-[-0.01em] text-text">
            {typeof heading === 'string' ? (
              <TextSwap value={heading}>{heading}</TextSwap>
            ) : (
              heading
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[14px] leading-5 text-text-secondary">
            <span className="whitespace-nowrap">
              {subtitle === undefined ? (
                <SyncSubtitle counts={counts} tasks={tasks} />
              ) : typeof subtitle === 'string' ? (
                <TextSwap value={subtitle}>{subtitle}</TextSwap>
              ) : (
                subtitle
              )}
            </span>
            <SyncStatusPopover
              tasks={tasks}
              open={popoverOpen}
              onOpenChange={setPopoverOpen}
            />
          </div>

          {onRetry && counts.failed > 0 && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onRetry(tasks.filter((task) => task.status === 'failed').map((task) => task.id))
                }
              >
                {retryLabel}
              </Button>
            </div>
          )}
        </div>

        {dismissible && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismiss}
            className={cn(
              'absolute right-2 top-2 grid size-7 place-items-center rounded-sm text-text-muted',
              'transition-[color,background-color,transform] duration-150 ease-out',
              'hover:bg-surface-sunken hover:text-text active:scale-95',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            )}
          >
            <XMarkIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}