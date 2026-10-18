import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface IconSwapItem {
  /** Identifies this layer; the item whose key matches `value` is shown. */
  key: string;
  node: ReactNode;
}

export interface IconSwapProps {
  /** Key of the icon to show. */
  value: string;
  items: IconSwapItem[];
  className?: string;
  /** Provide a label to expose the swap to assistive tech; otherwise hidden. */
  label?: string;
}

/**
 * "Icon swap" (transitions.dev) — icons sit stacked in one grid cell and
 * cross-fade in place with a scale + blur, so a glyph changing never pops.
 * Reduced motion keeps the cross-fade and drops the movement.
 */
export function IconSwap({ value, items, className, label }: IconSwapProps) {
  return (
    <span
      className={cn('c-icon-swap', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {items.map((item) => (
        <span
          key={item.key}
          className="c-icon"
          data-active={item.key === value ? 'true' : undefined}
          aria-hidden="true"
        >
          {item.node}
        </span>
      ))}
    </span>
  );
}