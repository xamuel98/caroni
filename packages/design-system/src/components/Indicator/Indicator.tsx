import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type IndicatorPlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type IndicatorColor = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type IndicatorSize = 'sm' | 'md' | 'lg';
/**
 * `edge` (default) centres the badge on the parent's 45° circle edge — correct
 * at every avatar/badge size. `corner` anchors the badge's outer corner to the
 * bounding box corner (flush) — the look you'd want for square icon buttons.
 */
export type IndicatorAnchor = 'edge' | 'corner';

const dirVars: Record<IndicatorPlacement, string> = {
  'top-right': '[--dds-ind-dir-x:1] [--dds-ind-dir-y:-1]',
  'top-left': '[--dds-ind-dir-x:-1] [--dds-ind-dir-y:-1]',
  'bottom-right': '[--dds-ind-dir-x:1] [--dds-ind-dir-y:1]',
  'bottom-left': '[--dds-ind-dir-x:-1] [--dds-ind-dir-y:1]',
};

// ~15% inset is r − r/√2 (≈14.65% of the diameter) of a circle; the 1/2
// translate re-centres the badge on that point regardless of its own size.
const edgePlacement: Record<IndicatorPlacement, string> = {
  'top-right': 'right-[15%] top-[15%] translate-x-1/2 -translate-y-1/2',
  'top-left': 'left-[15%] top-[15%] -translate-x-1/2 -translate-y-1/2',
  'bottom-right': 'right-[15%] bottom-[15%] translate-x-1/2 translate-y-1/2',
  'bottom-left': 'left-[15%] bottom-[15%] -translate-x-1/2 translate-y-1/2',
};

const cornerPlacement: Record<IndicatorPlacement, string> = {
  'top-right': 'right-0 top-0 translate-x-1/2 -translate-y-1/2',
  'top-left': 'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
  'bottom-right': 'right-0 bottom-0 translate-x-1/2 translate-y-1/2',
  'bottom-left': 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2',
};

const colorClasses: Record<IndicatorColor, string> = {
  accent: 'bg-accent text-accent-fg',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
  info: 'bg-info text-white',
  neutral: 'bg-text-secondary text-surface',
};

const dotSize: Record<IndicatorSize, string> = {
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3',
};
const badgeSize: Record<IndicatorSize, string> = {
  sm: 'h-3.5 min-w-3.5 px-1 text-[9px]',
  md: 'h-4 min-w-4 px-1 text-[10px]',
  lg: 'h-5 min-w-5 px-1.5 text-[11px]',
};
const iconBox: Record<IndicatorSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
};
const iconGlyph: Record<IndicatorSize, string> = {
  sm: '[&_svg]:size-2',
  md: '[&_svg]:size-2.5',
  lg: '[&_svg]:size-3',
};

export interface IndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** Corner, relative to a `relative` parent. Defaults to `bottom-right`. */
  placement?: IndicatorPlacement;
  /**
   * How the badge is anchored: `edge` (default) centres it on the parent's
   * circle edge; `corner` pins it to the bounding-box corner (for square
   * parents). See `IndicatorAnchor`.
   */
  anchor?: IndicatorAnchor;
  color?: IndicatorColor;
  size?: IndicatorSize;
  /** Numeric/text content — turns the dot into a count badge. */
  count?: number | string;
  /** Icon content — turns the dot into an icon badge. */
  icon?: ReactNode;
  /** Accessible label (rendered visually hidden). */
  label?: string;
  /** Spring pop-in with a diagonal slide. Defaults to true. */
  animated?: boolean;
  /** Ring colour separating the badge from what's behind it. Defaults to `ring-bg`
   * — override (e.g. `ring-surface`) when the badge sits on a card or a ghost
   * button over a non-bg surface. */
  ringClassName?: string;
}

/**
 * A status badge you can pin to the corner of an avatar, icon button, or any
 * `relative` element. Renders a dot by default, or a count / icon badge.
 */
export function Indicator({
  className,
  placement = 'bottom-right',
  anchor = 'edge',
  color = 'accent',
  size = 'md',
  count,
  icon,
  label,
  animated = true,
  ringClassName,
  ...props
}: IndicatorProps) {
  const hasContent = count != null || icon != null;
  const position = (anchor === 'corner' ? cornerPlacement : edgePlacement)[placement];

  return (
    <span
      aria-hidden={label ? undefined : true}
      className={cn(
        'pointer-events-none absolute z-10 grid place-items-center rounded-full font-medium leading-none ring-2 ring-bg',
        colorClasses[color],
        position,
        dirVars[placement],
        icon ? iconBox[size] : hasContent ? badgeSize[size] : dotSize[size],
        animated && 'animate-indicator-pop',
        ringClassName,
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className={cn('grid place-items-center', iconGlyph[size])}>{icon}</span>
      ) : count != null ? (
        <span className="tabular-nums">{count}</span>
      ) : null}
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
