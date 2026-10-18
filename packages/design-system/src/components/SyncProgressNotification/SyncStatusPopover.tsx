import * as PopoverPrimitive from '@radix-ui/react-popover';
import { InformationCircleIcon } from '@heroicons/react/20/solid';
import { useCallback, useEffect, useId, useRef } from 'react';
import { cn } from '../../lib/cn';
import { SyncStatusRow } from './SyncStatusRow';
import type { SyncTask } from './types';

export interface SyncStatusPopoverProps {
  tasks: SyncTask[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

/** Grace period so the pointer can travel from the icon into the panel. */
const CLOSE_DELAY = 220;

/**
 * The information trigger plus its charcoal status panel.
 *
 * Open state is fully controlled (Radix `Anchor`, not `Trigger`) so hover,
 * focus and tap never fight each other. Radix's "outside" dismiss is suppressed
 * for interactions on the trigger itself — otherwise clicking the icon would
 * close the panel that hover just opened ("acting up"). Dismissal is owned by
 * us: hover-out (with a grace period), click, outside interaction, or Escape.
 */
export function SyncStatusPopover({
  tasks,
  open,
  onOpenChange,
  className,
}: SyncStatusPopoverProps) {
  const contentId = useId();
  const closeTimer = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // True between pointerdown and click — lets `onFocus` ignore pointer-driven
  // focus so it doesn't double-fire alongside the click.
  const pointerDown = useRef(false);
  // Set while we restore focus to the icon after closing, so the resulting
  // `focus` event doesn't immediately re-open the panel.
  const suppressOpen = useRef(false);

  const isInsideTrigger = (target: EventTarget | null) =>
    target instanceof Node && triggerRef.current?.contains(target) === true;

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => onOpenChange(false), CLOSE_DELAY);
  }, [cancelClose, onOpenChange]);

  useEffect(() => cancelClose, [cancelClose]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Anchor asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Sync status details"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={contentId}
          data-state={open ? 'open' : 'closed'}
          className={cn(
            'grid size-4 shrink-0 place-items-center rounded-full text-text-muted',
            'transition-colors duration-150 ease-out hover:text-text',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            'data-[state=open]:text-text',
          )}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') onOpenChange(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') scheduleClose();
          }}
          onPointerDown={() => {
            pointerDown.current = true;
            suppressOpen.current = false;
          }}
          onFocus={() => {
            // Ignore the focus we restore programmatically right after closing.
            if (suppressOpen.current) {
              suppressOpen.current = false;
              return;
            }
            if (!pointerDown.current) onOpenChange(true);
          }}
          onClick={() => {
            pointerDown.current = false;
            onOpenChange(!open);
          }}
        >
          <InformationCircleIcon className="size-4" />
        </button>
      </PopoverPrimitive.Anchor>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          id={contentId}
          role="dialog"
          aria-label="Sync status"
          side="top"
          align="start"
          alignOffset={-6}
          sideOffset={10}
          collisionPadding={8}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => {
            // Anchor isn't a Trigger, so return focus to the icon ourselves.
            event.preventDefault();
            suppressOpen.current = true;
            triggerRef.current?.focus();
          }}
          // Keep the panel open while the user is on the trigger; our own
          // hover/click logic decides when it actually closes.
          onInteractOutside={(event) => {
            if (isInsideTrigger(event.target)) event.preventDefault();
          }}
          onFocusOutside={(event) => {
            if (isInsideTrigger(event.target)) event.preventDefault();
          }}
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
          className={cn(
            'c-sync-popover z-[80] w-48 rounded-xl bg-[#5B5B5B] p-3 text-white outline-none',
            'shadow-[0_18px_48px_-16px_rgb(0_0_0/0.5)]',
            // Origin-aware: scales out of the icon it belongs to.
            'origin-[var(--radix-popover-content-transform-origin)]',
            'data-[state=open]:animate-tooltip-in data-[state=closed]:animate-tooltip-out',
            className,
          )}
        >
          <div>
            {tasks.map((task) => (
              <SyncStatusRow key={task.id} label={task.label} status={task.status} />
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}