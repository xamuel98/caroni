import { cn } from '../../lib/cn';
import { FLAG_VIEWBOX, flagBodies } from './flagData';

// Svalbard has no dedicated circle-flag; Norway is the conventional stand-in.
const ALIASES: Record<string, string> = { sj: 'no' };

// Neutral fallback for any code without a circle-flag.
const FALLBACK =
  '<circle cx="256" cy="256" r="256" fill="#c7c7cf"/><g fill="none" stroke="#fff" stroke-width="26"><circle cx="256" cy="256" r="150"/><ellipse cx="256" cy="256" rx="72" ry="150"/><path d="M106 256h300"/></g>';

export interface FlagProps {
  /** ISO 3166-1 alpha-2 code (case-insensitive), e.g. `NG`. */
  iso2: string;
  className?: string;
}

/** A round country flag (circle-flags set), rendered as inline SVG. */
export function Flag({ iso2, className }: FlagProps) {
  const code = iso2.toLowerCase();
  const body = flagBodies[ALIASES[code] ?? code] ?? FALLBACK;

  return (
    <svg
      viewBox={FLAG_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className={cn('size-4 shrink-0 rounded-full', className)}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}