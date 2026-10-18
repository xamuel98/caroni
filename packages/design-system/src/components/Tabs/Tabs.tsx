import * as TabsPrimitive from '@radix-ui/react-tabs';
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';

export const Tabs = TabsPrimitive.Root;

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';

interface Indicator {
  left: number;
  width: number;
  total: number;
}

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    /** Hide the sliding active indicator. Defaults to true. */
    indicator?: boolean;
  }
>(({ className, children, indicator = true, ...props }, ref) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<Indicator | null>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!active) return;
    setBox({ left: active.offsetLeft, width: active.offsetWidth, total: list.offsetWidth });
  }, []);

  useLayoutEffect(() => {
    measure();
    // Measure once more after paint so the indicator appears in place on mount
    // instead of sliding in from the first tab.
    const raf = requestAnimationFrame(() => {
      measure();
      setReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [measure]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    list.querySelectorAll<HTMLElement>('[role="tab"]').forEach((tab) => ro.observe(tab));
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof MutationObserver === 'undefined') return;
    const mo = new MutationObserver(() => measure());
    mo.observe(list, { subtree: true, attributes: true, attributeFilter: ['data-state'] });
    return () => mo.disconnect();
  }, [measure]);

  const setRefs = (node: HTMLDivElement | null) => {
    listRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <TabsPrimitive.List
      ref={setRefs}
      className={cn(
        'relative inline-flex h-9 items-center rounded-[8px] bg-surface-sunken p-1',
        className,
      )}
      {...props}
    >
      {indicator && box && (
        <span
          aria-hidden="true"
          className={cn(
            // Full-width pill clipped to the active tab: the visible region is
            // revealed with `clip-path` insets, so the slide is compositor
            // work — no `width`/`left` layout animation.
            'pointer-events-none absolute inset-x-0 bottom-1 top-1 bg-surface-raised',
            'shadow-[var(--shadow-control)]',
            ready
              ? 'transition-[clip-path] duration-[var(--duration-base)] ease-out motion-reduce:transition-none'
              : 'transition-none',
          )}
          style={{
            clipPath: `inset(0 ${box.total - box.left - box.width}px 0 ${box.left}px round 6px)`,
          }}
        />
      )}
      {children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** Content shown after the label — e.g. a count, a dot, or a small Badge. */
  indicator?: ReactNode;
}

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, indicator, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'relative z-10 inline-flex h-7 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm px-3',
      'text-[13px] font-medium leading-none text-text-secondary outline-none',
      'transition-colors duration-150 ease-out',
      'data-[state=active]:text-text data-[state=inactive]:hover:text-text',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[disabled]:text-text-disabled',
      className,
    )}
    {...props}
  >
    <span className="truncate">{children}</span>
    {indicator !== undefined && indicator !== null && (
      <span className="inline-flex shrink-0 items-center">{indicator}</span>
    )}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = 'TabsTrigger';
