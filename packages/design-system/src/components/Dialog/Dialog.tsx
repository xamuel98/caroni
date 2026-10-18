import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XMarkIcon } from '@heroicons/react/20/solid';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import { Drawer } from 'vaul';
import {
  createContext,
  forwardRef,
  useContext,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { StatusCheck } from '../Transitions';

export const DialogPortal = DialogPrimitive.Portal;

/* ── Responsive mode ──────────────────────────────────────────────────────
 * ≤ 640px renders a Vaul bottom sheet (drag-to-dismiss, sheet easing); above
 * that, a centred Radix dialog. One API, two physical forms.
 * ---------------------------------------------------------------------- */
const MobileContext = createContext(false);
const DESKTOP_QUERY = '(min-width: 641px)';

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  children?: ReactNode;
}

export function Dialog({ children, ...props }: DialogProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  return (
    <MobileContext.Provider value={!isDesktop}>
      {isDesktop ? (
        <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>
      ) : (
        <Drawer.Root {...props}>{children}</Drawer.Root>
      )}
    </MobileContext.Provider>
  );
}

const useIsMobile = () => useContext(MobileContext);

export const DialogTrigger = forwardRef<
  ElementRef<typeof DialogPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>((props, ref) =>
  useIsMobile() ? (
    <Drawer.Trigger ref={ref} {...props} />
  ) : (
    <DialogPrimitive.Trigger ref={ref} {...props} />
  ),
);
DialogTrigger.displayName = 'DialogTrigger';

export const DialogClose = forwardRef<
  ElementRef<typeof DialogPrimitive.Close>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>((props, ref) =>
  useIsMobile() ? (
    <Drawer.Close ref={ref} {...props} />
  ) : (
    <DialogPrimitive.Close ref={ref} {...props} />
  ),
);
DialogClose.displayName = 'DialogClose';

/**
 * Centred icon above the title. Pass a solid Heroicon (24) — it is coloured by
 * tone and sized here; no extra background, just the solid glyph.
 */
export const dialogIconVariants = cva('mb-4 grid shrink-0 place-items-center [&_svg]:size-8', {
  variants: {
    tone: {
      accent: 'text-accent',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      info: 'text-info',
      neutral: 'text-text-secondary',
    },
  },
  defaultVariants: { tone: 'accent' },
});

export interface DialogIconProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogIconVariants> {}

export function DialogIcon({ className, tone, ...props }: DialogIconProps) {
  return <div className={cn(dialogIconVariants({ tone }), className)} {...props} />;
}

export type DialogStatusTone = 'success' | 'warning' | 'info' | 'error';

// Circle medallion colours (soft fill + tone glyph), matching the icon tones.
const dialogStatusCircle: Record<DialogStatusTone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  error: 'bg-danger-soft text-danger',
};

// Non-success tones keep the plain heroicons they have always used.
const dialogStatusGlyph: Record<Exclude<DialogStatusTone, 'success'>, ReactNode> = {
  warning: <ExclamationTriangleIcon />,
  info: <InformationCircleIcon />,
  error: <XCircleIcon />,
};

export interface DialogStatusIconProps extends HTMLAttributes<HTMLDivElement> {
  /** Which glyph to draw. Only `success` is animated. Defaults to `success`. */
  tone?: DialogStatusTone;
}

/**
 * A circular status medallion for a dialog header — a soft, tone-coloured disc
 * with the glyph inside. `success` runs the transitions.dev check animation
 * (draw-in); the other tones use their regular icons.
 */
export function DialogStatusIcon({ tone = 'success', className, ...props }: DialogStatusIconProps) {
  return (
    <div
      className={cn(
        'mb-4 grid size-12 shrink-0 place-items-center rounded-full [&_svg]:size-6',
        dialogStatusCircle[tone],
        className,
      )}
      {...props}
    >
      {tone === 'success' ? <StatusCheck /> : dialogStatusGlyph[tone]}
    </div>
  );
}

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const cls = cn(
    'font-display text-[17px] font-medium leading-6 tracking-tight text-text text-balance',
    className,
  );
  return useIsMobile() ? (
    <Drawer.Title ref={ref} className={cls} {...props} />
  ) : (
    <DialogPrimitive.Title ref={ref} className={cls} {...props} />
  );
});
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  const cls = cn('mt-2 text-[13px] leading-5 text-text-secondary text-pretty', className);
  return useIsMobile() ? (
    <Drawer.Description ref={ref} className={cls} {...props} />
  ) : (
    <DialogPrimitive.Description ref={ref} className={cls} {...props} />
  );
});
DialogDescription.displayName = 'DialogDescription';

function CloseButton({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Close>) {
  // Mobile (Vaul sheet) dismisses by drag or backdrop — no corner icon.
  if (useIsMobile()) return null;
  return (
    <DialogPrimitive.Close
      className={cn(
        'absolute right-3 top-3 grid size-7 place-items-center rounded-sm text-text-muted',
        'transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-text',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
      {...props}
    >
      <XMarkIcon className="size-4" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );
}

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-[rgb(16_16_20/0.5)] backdrop-blur-[2px] dark:bg-[rgb(0_0_0/0.6)]',
      'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

export interface DialogContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Render the built-in dismiss button (top-right). Desktop only. Defaults to true. */
  showClose?: boolean;
}

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showClose = true, ...props }, ref) => {
  if (useIsMobile()) {
    return (
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-[rgb(16_16_20/0.5)] dark:bg-[rgb(0_0_0/0.6)]" />
        <Drawer.Content
          ref={ref}
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[92dvh] flex-col rounded-t-lg',
            'border-t border-border bg-surface-raised shadow-[0_-8px_40px_-8px_rgb(16_16_20/0.28)] outline-none dark:shadow-[0_-8px_40px_-8px_rgb(0_0_0/0.7)]',
            className,
          )}
          {...props}
        >
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border-strong" />
          <div
            className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            {children}
          </div>
          {showClose && <CloseButton />}
        </Drawer.Content>
      </Drawer.Portal>
    );
  }

  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      {/* A transparent scrollable wrapper centres the dialog. Clicks on the
          wrapper (not the panel) are "outside" to Radix, so the backdrop still
          dismisses — without the transform hacks that caused the jump. */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              'relative w-full max-w-[400px] rounded-lg border border-border bg-surface-raised p-6 outline-none',
              'shadow-[0_24px_64px_-16px_rgb(16_16_20/0.32),0_2px_8px_-2px_rgb(16_16_20/0.1)]',
              'dark:shadow-[0_24px_64px_-16px_rgb(0_0_0/0.7),0_2px_8px_-2px_rgb(0_0_0/0.4)]',
              'data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out',
              className,
            )}
            {...props}
          >
            {children}
            {showClose && <CloseButton />}
          </DialogPrimitive.Content>
        </div>
      </div>
    </DialogPrimitive.Portal>
  );
});
DialogContent.displayName = 'DialogContent';

/** Centred header: icon (optional) → title → description. */
export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col items-center text-center', className)}
      {...props}
    />
  );
}

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `row` (default) — full-width buttons side by side, equal width.
   * `column` — full-width buttons stacked.
   */
  orientation?: 'row' | 'column';
}

export function DialogFooter({ className, orientation = 'row', ...props }: DialogFooterProps) {
  return (
    <div
      className={cn(
        // Divider + 16px padding all round.
        'mt-6 flex gap-2 border-t border-border p-4',
        // Bleed to the panel/sheet edges. The surrounding padding differs per
        // form: desktop panel is p-6, the mobile sheet wrapper is px-5/pb-6.
        '-mx-5 -mb-6 min-[641px]:-mx-6',
        orientation === 'column' ? 'flex-col [&>*]:w-full' : '[&>*]:flex-1',
        className,
      )}
      {...props}
    />
  );
}
