import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid';
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';

export const PaginationButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      'inline-flex size-8 items-center justify-center rounded-sm border border-border-strong bg-surface text-[13px] font-medium tabular-nums text-text',
      'transition-colors duration-150 ease-out hover:bg-surface-sunken',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
PaginationButton.displayName = 'PaginationButton';

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** Windowed page list with ellipses, e.g. `1 … 4 5 6 … 20`. */
function getPages(current: number, count: number, siblings: number): (number | 'ellipsis')[] {
  const total = siblings * 2 + 5;
  if (count <= total) return range(1, count);

  const left = Math.max(current - siblings, 2);
  const right = Math.min(current + siblings, count - 1);
  const items: (number | 'ellipsis')[] = [1];

  if (left > 2) items.push('ellipsis');
  for (const page of range(left, right)) items.push(page);
  if (right < count - 1) items.push('ellipsis');

  items.push(count);
  return items;
}

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  /** Pages shown either side of the current one. Defaults to 1. */
  siblingCount?: number;
  /** Show `Previous` / `Next` text beside the chevrons. Defaults to false. */
  showLabels?: boolean;
  /** Render jump-to-first / jump-to-last (double-chevron) buttons. */
  showEdges?: boolean;
  /** Text for the previous control. Defaults to `Previous`. */
  previousLabel?: string;
  /** Text for the next control. Defaults to `Next`. */
  nextLabel?: string;
}

export function Pagination({
  className,
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  showLabels = false,
  showEdges = false,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  ...props
}: PaginationProps) {
  const go = (next: number) => onPageChange?.(Math.min(Math.max(next, 1), pageCount));
  const pages = getPages(page, pageCount, siblingCount);
  const activeIndex = pages.indexOf(page);

  // Buttons are `size-8` (32px) with a `gap-1` (4px) gutter, so the accent
  // pill slides a fixed 36px per step — no measurement, no layout thrash.
  const step = 36;
  // Labelled controls grow to fit their text; icon-only ones stay square.
  const labelled = showLabels ? 'w-auto gap-1.5 px-2.5' : undefined;

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center gap-1', className)}
      {...props}
    >
      {showEdges && (
        <PaginationButton
          aria-label="First page"
          disabled={page <= 1}
          onClick={() => go(1)}
        >
          <ChevronDoubleLeftIcon className="size-4" />
        </PaginationButton>
      )}

      <PaginationButton
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className={labelled}
      >
        <ChevronLeftIcon className="size-4" />
        {showLabels && <span>{previousLabel}</span>}
      </PaginationButton>

      <div className="relative flex items-center gap-1">
        {activeIndex >= 0 && (
          <span
            aria-hidden="true"
            // On-screen movement, so it eases with `--ease-in-out` (not the
            // entrance `--ease-out`): it accelerates out of its old slot and
            // settles into the new one, sliding left ↔ right with direction.
            className="pointer-events-none absolute left-0 top-1/2 size-8 rounded-sm bg-accent will-change-transform transition-transform duration-[var(--duration-base)] ease-in-out motion-reduce:transition-none"
            style={{ transform: `translate3d(${activeIndex * step}px, -50%, 0)` }}
          />
        )}

        {pages.map((item, i) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              aria-hidden="true"
              className="relative z-10 grid size-8 place-items-center text-[13px] text-text-muted"
            >
              ...
            </span>
          ) : (
            <PaginationButton
              key={item}
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => go(item)}
              className={cn(
                'relative z-10 border-transparent bg-transparent hover:bg-surface-sunken active:scale-95',
                'transition-[color,background-color,transform] duration-150 ease-out',
                item === page && 'text-accent-fg hover:bg-transparent',
              )}
            >
              {item}
            </PaginationButton>
          ),
        )}
      </div>

      <PaginationButton
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => go(page + 1)}
        className={labelled}
      >
        {showLabels && <span>{nextLabel}</span>}
        <ChevronRightIcon className="size-4" />
      </PaginationButton>

      {showEdges && (
        <PaginationButton
          aria-label="Last page"
          disabled={page >= pageCount}
          onClick={() => go(pageCount)}
        >
          <ChevronDoubleRightIcon className="size-4" />
        </PaginationButton>
      )}
    </nav>
  );
}
