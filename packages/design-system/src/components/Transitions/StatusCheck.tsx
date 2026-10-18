import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

export interface StatusCheckProps {
  /** Force the animation state. Omit to autoplay on mount. */
  state?: 'in' | 'out';
  className?: string;
}

/**
 * "Success check" (transitions.dev). The mark fades, rotates, un-blurs and bobs
 * up while its stroke draws itself in. Coloured by `currentColor`, so wrap it in
 * a tone (e.g. a medallion) to theme it.
 */
export function StatusCheck({ state, className }: StatusCheckProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [internal, setInternal] = useState<'in' | 'out'>('out');
  const controlled = state !== undefined;

  useEffect(() => {
    if (controlled) return;
    setInternal('out');
    const raf = window.requestAnimationFrame(() => {
      // Force a layout commit so the keyframes restart from offset 0.
      if (ref.current) void ref.current.offsetWidth;
      setInternal('in');
    });
    return () => window.cancelAnimationFrame(raf);
  }, [controlled]);

  return (
    <span
      ref={ref}
      className={cn('c-status-check', className)}
      data-state={controlled ? state : internal}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
      >
        <path d="M4.5 12.75l6 6 9-13.5" data-draw pathLength={1} />
      </svg>
    </span>
  );
}