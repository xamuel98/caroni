import { cn } from '../../lib/cn';

export interface SpinnerProps {
  className?: string;
}

/**
 * A thick accent arc spinning on a grey track ring — the arc sits inside the
 * ring, which gives it a quiet background rather than floating on nothing.
 */
export function Spinner({ className }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('animate-spin motion-reduce:animate-none', className)}
    >
      <circle cx="12" cy="12" r="9" className="stroke-border-strong" strokeWidth="2.5" />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        className="stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
