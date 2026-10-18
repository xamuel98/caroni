import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Read a CSS time custom property (e.g. `--text-swap-dur: 130ms`) in ms. */
function cssTimeVar(name: string, fallbackMs: number): number {
  if (typeof window === 'undefined') return fallbackMs;
  const raw = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) return fallbackMs;
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallbackMs;
  return raw.endsWith('ms') ? value : value * 1000;
}

export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduce;
}

type SwapPhase = 'rest' | 'exit' | 'enter';

export interface TextSwapProps {
  /** Changing this string triggers the swap; it also keys the outgoing content. */
  value: string;
  children: ReactNode;
  className?: string;
}

/**
 * "Text states swap" (transitions.dev) — the old text exits up with blur, then
 * the new text enters from below and sharpens. A single element is animated in
 * three phases (exit → jump-below with no transition → settle), so the two
 * states never overlap on screen. Reduced motion swaps instantly.
 */
export function TextSwap({ value, children, className }: TextSwapProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [displayed, setDisplayed] = useState<ReactNode>(children);
  const [phase, setPhase] = useState<SwapPhase>('rest');
  const valueRef = useRef(value);
  const latest = useRef(children);
  latest.current = children;

  useEffect(() => {
    if (value === valueRef.current) return;
    valueRef.current = value;

    if (reduceMotion) {
      setDisplayed(latest.current);
      return;
    }

    setPhase('exit');
    const timer = window.setTimeout(() => {
      setDisplayed(latest.current);
      setPhase('enter');
    }, cssTimeVar('--text-swap-dur', 130));

    return () => window.clearTimeout(timer);
  }, [value, reduceMotion]);

  // Once the new text has painted at its below/offset start, release it so it
  // transitions back to rest and sharpens.
  useEffect(() => {
    if (phase !== 'enter') return;
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      inner = window.requestAnimationFrame(() => setPhase('rest'));
    });
    return () => {
      window.cancelAnimationFrame(outer);
      if (inner) window.cancelAnimationFrame(inner);
    };
  }, [phase]);

  return (
    <span
      className={cn(
        'c-text-swap',
        phase === 'exit' && 'is-exit',
        phase === 'enter' && 'is-enter-start',
        className,
      )}
    >
      {displayed}
    </span>
  );
}

export interface DigitNumberProps {
  /** Digits (and separators) to render; each character animates independently. */
  value: string;
  className?: string;
}

/**
 * "Number pop-in" (transitions.dev) — each character enters from a direction
 * with blur, the trailing two staggered so decimals settle a beat later.
 * Replays whenever `value` changes (a forced reflow restarts the animation).
 */
export function DigitNumber({ value, className }: DigitNumberProps) {
  const groupRef = useRef<HTMLSpanElement | null>(null);
  const mounted = useRef(false);
  const chars = value.split('');

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    // Skip the first run: the `is-animating` class already plays on mount.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    group.classList.remove('is-animating');
    void group.offsetHeight; // force reflow
    group.classList.add('is-animating');
  }, [value]);

  return (
    <span ref={groupRef} className={cn('c-digit-group is-animating', className)}>
      {chars.map((char, index) => {
        const fromEnd = chars.length - index;
        const stagger = fromEnd === 2 ? '1' : fromEnd === 1 ? '2' : undefined;
        return (
          <span key={index} className="c-digit" data-stagger={stagger}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
}