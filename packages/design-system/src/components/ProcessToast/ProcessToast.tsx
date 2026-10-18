import * as ToastPrimitive from '@radix-ui/react-toast';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../Button';
import { Spinner } from '../Spinner';
import { Toast, ToastDescription, ToastTitle } from '../Toast';
import { DigitNumber, IconSwap, TextSwap } from '../Transitions';

export type ProcessStatus = 'queued' | 'running' | 'success' | 'failed';

export interface ProcessItem {
  id: string;
  label: ReactNode;
  status: ProcessStatus;
  /** Optional second line — e.g. an error reason. */
  detail?: ReactNode;
}

export interface ProcessToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** e.g. "Processing transfers" */
  title: ReactNode;
  items: ProcessItem[];
  /** Called with the ids of every failed item when "Retry" is pressed. */
  onRetry?: (failedIds: string[]) => void;
  className?: string;
}

/** Grey track ring — the idle/queued counterpart to the spinner. */
function Ring({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" className="stroke-border-strong" strokeWidth="2.5" />
    </svg>
  );
}

/**
 * Crossfades between status glyphs with a scale + blur, so an icon changing in
 * place never pops.
 */
function StatusGlyph({ state, className }: { state: ProcessStatus; className?: string }) {
  return (
    <IconSwap
      value={state}
      className={cn('[&_svg]:size-full', className)}
      items={[
        { key: 'queued', node: <Ring /> },
        { key: 'running', node: <Spinner className="text-accent" /> },
        { key: 'success', node: <CheckCircleIcon className="text-success" /> },
        { key: 'failed', node: <ExclamationTriangleIcon className="text-warning" /> },
      ]}
    />
  );
}

/** Animated batch summary: the counters flip in, the verb cross-fades. */
export function ProcessSummary({
  settled,
  success,
  total,
  failed,
  allDone,
}: {
  settled: number;
  success: number;
  total: number;
  failed: number;
  allDone: boolean;
}) {
  if (!total) return <>Nothing to process</>;

  const single = allDone && failed === 0;
  const first = allDone && failed > 0 ? success : settled;

  return (
    <>
      <DigitNumber value={String(single ? total : first)} />
      {!single && (
        <>
          {' of '}
          <DigitNumber value={String(total)} />{' '}
        </>
      )}
      <TextSwap value={single ? 'completed' : 'complete'}>
        {single ? ' completed' : ' complete'}
      </TextSwap>
      {failed > 0 && (
        <span className="text-warning capitalize">
          {' · '}
          <DigitNumber value={String(failed)} />
          {' failed'}
        </span>
      )}
    </>
  );
}

/**
 * One toast for a batch of async work — instead of stacking a toast per item,
 * it aggregates progress ("2 of 3 complete · 1 failed") and expands into a
 * per-item list with a retry action. Stays open while anything is in flight.
 */
export function ProcessToast({
  open,
  onOpenChange,
  title,
  items,
  onRetry,
  className,
}: ProcessToastProps) {
  const [expanded, setExpanded] = useState(false);

  const total = items.length;
  const success = items.filter((i) => i.status === 'success').length;
  const failed = items.filter((i) => i.status === 'failed').length;
  const running = items.some((i) => i.status === 'running');
  const settled = success + failed;
  const allDone = total > 0 && settled === total;
  const fraction = total > 0 ? settled / total : 0;

  const headerState: ProcessStatus = !total
    ? 'success'
    : allDone
      ? failed
        ? 'failed'
        : 'success'
      : running
        ? 'running'
        : 'queued';

  const barTone = !allDone ? 'bg-accent' : failed ? 'bg-warning' : 'bg-success';

  /* Height-animated disclosure so the toast grows/shrinks smoothly. */
  const [detailsMounted, setDetailsMounted] = useState(false);
  const [detailsHeight, setDetailsHeight] = useState(0);
  const detailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (expanded) setDetailsMounted(true);
  }, [expanded]);

  useLayoutEffect(() => {
    if (!detailsMounted || !detailsRef.current) return;
    setDetailsHeight(expanded ? detailsRef.current.scrollHeight : 0);
  }, [detailsMounted, expanded, items]);

  useEffect(() => {
    if (expanded || !detailsMounted) return;
    const timer = setTimeout(() => setDetailsMounted(false), 350);
    return () => clearTimeout(timer);
  }, [expanded, detailsMounted]);

  useEffect(() => {
    if (!expanded || !detailsMounted) return;
    const el = detailsRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setDetailsHeight(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, detailsMounted]);

  return (
    <Toast
      open={open}
      onOpenChange={onOpenChange}
      // Keep the batch visible until it finishes; then auto-dismiss.
      duration={allDone ? undefined : Number.POSITIVE_INFINITY}
      className={cn('block p-0', className)}
    >
      <div className="flex items-start gap-3 p-3.5">
        <StatusGlyph state={headerState} className="mt-0.5 size-5 shrink-0" />

        <div className="min-w-0 flex-1">
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription className="mt-0.5">
            <ProcessSummary
              settled={settled}
              success={success}
              total={total}
              failed={failed}
              allDone={allDone}
            />
          </ToastDescription>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {total > 1 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Hide details' : 'Show details'}
              className="grid size-7 place-items-center rounded-sm text-text-muted transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <ChevronDownIcon
                className={cn(
                  'size-4 transition-transform duration-200 ease-out motion-reduce:transition-none',
                  expanded && 'rotate-180',
                )}
              />
            </button>
          )}
          <ToastPrimitive.Close className="grid size-7 place-items-center rounded-sm text-text-muted transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <XMarkIcon className="size-4" />
            <span className="sr-only">Dismiss</span>
          </ToastPrimitive.Close>
        </div>
      </div>

      <div className="px-3.5 pb-3.5">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={settled}
          aria-label="Progress"
          className="h-1 overflow-hidden rounded-full bg-surface-sunken"
        >
          <div
            className={cn(
              'h-full origin-left rounded-full ease-out motion-reduce:transition-none',
              'transition-[transform,background-color] duration-[var(--duration-slow)]',
              barTone,
            )}
            style={{ transform: `scaleX(${fraction})` }}
          />
        </div>
      </div>

      <div
        className="overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
        style={{ height: detailsHeight }}
        onTransitionEnd={() => {
          if (!expanded) setDetailsMounted(false);
        }}
      >
        {detailsMounted && (
          <div ref={detailsRef} className="border-t border-border">
            <ul className="max-h-56 overflow-y-auto p-1.5">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 rounded-sm px-2 py-1.5">
                  <StatusGlyph state={item.status} className="mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] text-text">{item.label}</div>
                    {item.detail && (
                      <div className="mt-0.5 text-[12px] text-text-muted">{item.detail}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {failed > 0 && onRetry && (
              <div className="flex justify-end border-t border-border p-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    onRetry(items.filter((i) => i.status === 'failed').map((i) => i.id))
                  }
                >
                  Retry {failed} failed
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Toast>
  );
}
