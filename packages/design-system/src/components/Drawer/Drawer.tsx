import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XMarkIcon } from '@heroicons/react/20/solid';
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

const SideContext = createContext<DrawerSide>('right');

export interface DrawerProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  /** Which edge the panel slides from. Defaults to `right`. */
  side?: DrawerSide;
}

export function Drawer({ side = 'right', ...props }: DrawerProps) {
  return (
    <SideContext.Provider value={side}>
      <DialogPrimitive.Root {...props} />
    </SideContext.Provider>
  );
}

export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;
export const DrawerPortal = DialogPrimitive.Portal;

export const DrawerOverlay = forwardRef<
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
DrawerOverlay.displayName = 'DrawerOverlay';

const sideClasses: Record<DrawerSide, string> = {
  right: 'inset-y-0 right-0 h-full w-80 max-w-[85vw] border-l [--dds-drawer-x:100%]',
  left: 'inset-y-0 left-0 h-full w-80 max-w-[85vw] border-r [--dds-drawer-x:-100%]',
  top: 'inset-x-0 top-0 h-80 max-h-[85vh] w-full border-b [--dds-drawer-y:-100%]',
  bottom: 'inset-x-0 bottom-0 h-80 max-h-[85vh] w-full border-t [--dds-drawer-y:100%]',
};

export const DrawerContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const side = useContext(SideContext);
  return (
    <DialogPrimitive.Portal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 flex flex-col border-border bg-surface-raised outline-none',
          'shadow-[0_24px_64px_-16px_rgb(16_16_20/0.32)] dark:shadow-[0_24px_64px_-16px_rgb(0_0_0/0.7)]',
          sideClasses[side],
          'data-[state=open]:animate-drawer-in data-[state=closed]:animate-drawer-out motion-reduce:animate-none',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-3 top-3 grid size-7 place-items-center rounded-sm text-text-muted transition-colors duration-150 ease-out hover:bg-surface-sunken hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <XMarkIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
DrawerContent.displayName = 'DrawerContent';

export function DrawerHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 border-b border-border p-5 pr-10', className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-auto flex gap-2 border-t border-border p-4', className)} {...props} />;
}

export const DrawerTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('font-display text-[15px] font-medium tracking-tight text-text', className)}
    {...props}
  />
));
DrawerTitle.displayName = 'DrawerTitle';

export const DrawerDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-[13px] leading-5 text-text-secondary', className)}
    {...props}
  />
));
DrawerDescription.displayName = 'DrawerDescription';