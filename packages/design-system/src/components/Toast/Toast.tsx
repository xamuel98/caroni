import * as ToastPrimitive from '@radix-ui/react-toast';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
  type TransitionEvent,
} from 'react';
import { cn } from '../../lib/cn';

export const ToastAction = forwardRef<
  ElementRef<typeof ToastPrimitive.Action>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-7 shrink-0 items-center rounded-sm border border-border-strong bg-surface px-2 text-[12px] font-medium text-text',
      'transition-colors duration-150 ease-out hover:bg-surface-sunken',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';

export const ToastClose = forwardRef<
  ElementRef<typeof ToastPrimitive.Close>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'grid size-7 shrink-0 place-items-center rounded-sm text-text-muted',
      'transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-text',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      className,
    )}
    {...props}
  >
    <XMarkIcon className="size-4" />
    <span className="sr-only">Dismiss</span>
  </ToastPrimitive.Close>
));
ToastClose.displayName = 'ToastClose';

/**
 * A right-aligned, single-line row for the toast's action and dismiss button.
 * Wrap `<ToastAction>` / `<ToastClose>` in it so they sit on the same line,
 * top-aligned with the toast (not centred against a description).
 */
export function ToastActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('ml-auto flex shrink-0 items-center gap-1 self-start', className)}
      {...props}
    />
  );
}

/* ── Position ─────────────────────────────────────────────────────────── */

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Positions the docked viewport. `bottom-center` reads as a snackbar.
 * `--dds-toast-dir` flips the enter/exit travel so top toasts drop in from
 * above and bottom toasts rise from below.
 */
const positionClasses: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4 [--dds-toast-dir:-1]',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 [--dds-toast-dir:-1]',
  'top-right': 'top-4 right-4 [--dds-toast-dir:-1]',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};

export interface ToastProviderProps
  extends ComponentPropsWithoutRef<typeof ToastPrimitive.Provider> {
  /** Where toasts dock. Defaults to `bottom-right`. */
  position?: ToastPosition;
  viewportClassName?: string;
}

/**
 * Render once, near the app root. Hosts the viewport every `<Toast>` portals
 * into — swipe right to dismiss, and a dock position you can set per surface.
 */
export function ToastProvider({
  children,
  position = 'bottom-right',
  viewportClassName,
  ...props
}: ToastProviderProps) {
  const isTop = position.startsWith('top');
  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={6000} {...props}>
      {children}
      <ToastPrimitive.Viewport
        label="Notifications"
        className={cn(
          'fixed z-[60] flex w-[calc(100vw-2rem)] max-w-[400px] gap-2 outline-none',
          isTop ? 'flex-col-reverse' : 'flex-col',
          positionClasses[position],
          viewportClassName,
        )}
      />
    </ToastPrimitive.Provider>
  );
}

/* ── Toast ────────────────────────────────────────────────────────────── */

export type ToastVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

function ToastGlyph({ variant }: { variant: Exclude<ToastVariant, 'neutral'> }) {
  const base = 'mt-px size-5 shrink-0';
  switch (variant) {
    case 'success':
      return <CheckCircleIcon className={cn(base, 'text-success')} />;
    case 'warning':
      return <ExclamationTriangleIcon className={cn(base, 'text-warning')} />;
    case 'danger':
      return <XCircleIcon className={cn(base, 'text-danger')} />;
    case 'info':
      return <InformationCircleIcon className={cn(base, 'text-info')} />;
  }
}

export interface ToastProps extends ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  /** Status tone — prepends a matching icon. Defaults to `neutral` (no icon). */
  variant?: ToastVariant;
}

const toastClasses = cn(
  // Toasts are dynamic: transitions retarget from the current state, keyframes
  // restart. `.c-toast` owns the opacity/transform transition, @starting-style
  // and the swipe offsets (all on `transform` — never Tailwind's `translate`).
  'c-toast pointer-events-auto relative flex w-full items-start gap-3 rounded-md border border-border bg-surface-raised p-3.5',
  'shadow-[0_12px_32px_-12px_rgb(16_16_20/0.28)] dark:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.66)]',
);

/**
 * A single toast. Controlled via `open`/`onOpenChange` — the root is kept
 * mounted through its exit transition (Radix otherwise unmounts on the first
 * frame, since it waits for `animationend`, not `transitionend`).
 */
export const Toast = forwardRef<ElementRef<typeof ToastPrimitive.Root>, ToastProps>(
  ({ open, className, onTransitionEnd, variant = 'neutral', children, ...props }, ref) => {
    const isControlled = open !== undefined;
    const [mounted, setMounted] = useState(Boolean(open));
    const nodeRef = useRef<HTMLLIElement | null>(null);

    useEffect(() => {
      if (open) setMounted(true);
    }, [open]);

    // Safety net in case `transitionend` is skipped (e.g. reduced motion).
    useEffect(() => {
      if (!isControlled || open) return;
      const timer = setTimeout(() => setMounted(false), 320);
      return () => clearTimeout(timer);
    }, [isControlled, open]);

    const content: ReactNode = (
      <>
        {variant !== 'neutral' && <ToastGlyph variant={variant} />}
        {children}
      </>
    );

    if (!isControlled) {
      return (
        <ToastPrimitive.Root ref={ref} className={cn(toastClasses, className)} {...props}>
          {content}
        </ToastPrimitive.Root>
      );
    }
    if (!mounted) return null;

    const setRefs = (node: HTMLLIElement | null) => {
      nodeRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const handleTransitionEnd = (event: TransitionEvent<HTMLLIElement>) => {
      onTransitionEnd?.(event);
      if (event.target !== nodeRef.current) return;
      if (!open) setMounted(false);
    };

    return (
      <ToastPrimitive.Root
        ref={setRefs}
        forceMount
        open={open}
        onTransitionEnd={handleTransitionEnd}
        className={cn(toastClasses, className)}
        {...props}
      >
        {content}
      </ToastPrimitive.Root>
    );
  },
);
Toast.displayName = 'Toast';

export const ToastTitle = forwardRef<
  ElementRef<typeof ToastPrimitive.Title>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-[13px] font-medium leading-5 text-text', className)}
    {...props}
  />
));
ToastTitle.displayName = 'ToastTitle';

export const ToastDescription = forwardRef<
  ElementRef<typeof ToastPrimitive.Description>,
  ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-[13px] leading-5 text-text-secondary', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';
