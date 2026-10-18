import * as DialogPrimitive from '@radix-ui/react-dialog';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';

export interface CommandMenuItem {
  id: string;
  label: ReactNode;
  /** Plain text used for filtering. Falls back to `label` when it's a string. */
  value?: string;
  keywords?: string[];
  icon?: ReactNode;
  shortcut?: ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
  /** Id of the group this item belongs to. */
  group?: string;
}

export interface CommandMenuGroup {
  id: string;
  label?: ReactNode;
}

export interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandMenuItem[];
  groups?: CommandMenuGroup[];
  placeholder?: string;
  emptyMessage?: ReactNode;
  /** Accessible name for the dialog. Defaults to `Command menu`. */
  ariaLabel?: string;
  /** Bind ⌘K / Ctrl+K to toggle while mounted. Defaults to true. */
  hotkey?: boolean;
  className?: string;
}

function itemText(item: CommandMenuItem): string {
  const base = item.value ?? (typeof item.label === 'string' ? item.label : '');
  return [base, ...(item.keywords ?? [])].join(' ').toLowerCase();
}

/**
 * A ⌘K command palette. Keyboard-first, so — per the motion rules — it opens
 * with no entrance animation. Type to filter, ↑/↓ to move, Enter to run,
 * Escape to close.
 */
export function CommandMenu({
  open,
  onOpenChange,
  items,
  groups,
  placeholder = 'Type a command or search…',
  emptyMessage = 'No results',
  ariaLabel = 'Command menu',
  hotkey = true,
  className,
}: CommandMenuProps) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveId(null);
    }
  }, [open]);

  useEffect(() => {
    if (!hotkey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hotkey, open, onOpenChange]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => itemText(item).includes(q));
  }, [items, query]);

  const sections = useMemo(() => {
    const map = new Map<string, { id: string; label?: ReactNode; items: CommandMenuItem[] }>();
    const ensure = (id: string, label?: ReactNode) => {
      if (!map.has(id)) map.set(id, { id, label, items: [] });
      else if (label !== undefined) map.get(id)!.label = label;
    };
    groups?.forEach((group) => ensure(group.id, group.label));
    filtered.forEach((item) => ensure(item.group ?? '', undefined));
    filtered.forEach((item) => map.get(item.group ?? '')!.items.push(item));
    return [...map.values()].filter((section) => section.items.length > 0);
  }, [groups, filtered]);

  const selectableIds = useMemo(
    () => filtered.filter((item) => !item.disabled).map((item) => item.id),
    [filtered],
  );

  // Derive the active item: keep the current one if still valid, else the first.
  const active =
    activeId && selectableIds.includes(activeId) ? activeId : (selectableIds[0] ?? null);

  useEffect(() => {
    if (!active) return;
    itemRefs.current.get(active)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const select = (item: CommandMenuItem) => {
    if (item.disabled) return;
    item.onSelect?.();
    onOpenChange(false);
  };

  const move = (delta: number) => {
    if (!selectableIds.length) return;
    const current = active ? selectableIds.indexOf(active) : -1;
    const next = Math.min(Math.max(current + delta, 0), selectableIds.length - 1);
    setActiveId(selectableIds[next] ?? null);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActiveId(selectableIds[0] ?? null);
        break;
      case 'End':
        event.preventDefault();
        setActiveId(selectableIds[selectableIds.length - 1] ?? null);
        break;
      case 'Enter': {
        const item = filtered.find((i) => i.id === active);
        if (item) {
          event.preventDefault();
          select(item);
        }
        break;
      }
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgb(16_16_20/0.5)] dark:bg-[rgb(0_0_0/0.6)]" />
        <DialogPrimitive.Content
          aria-label={ariaLabel}
          className={cn(
            'fixed left-1/2 top-[12vh] z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 outline-none',
            'overflow-hidden rounded-lg border border-border bg-surface-raised',
            'shadow-[0_24px_64px_-16px_rgb(16_16_20/0.32)] dark:shadow-[0_24px_64px_-16px_rgb(0_0_0/0.7)]',
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">{ariaLabel}</DialogPrimitive.Title>

          <div className="flex items-center gap-2 border-b border-border px-3">
            <MagnifyingGlassIcon className="size-4 shrink-0 text-text-muted" />
            <input
              autoFocus
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active ? `${listId}-${active}` : undefined}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveId(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="h-11 w-full bg-transparent text-[16px] text-text placeholder:text-text-muted focus-visible:outline-none md:text-[14px]"
            />
          </div>

          <div
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            className="max-h-[320px] overflow-y-auto p-1.5"
          >
            {sections.length === 0 ? (
              <div className="px-3 py-6 text-center text-[13px] text-text-muted">{emptyMessage}</div>
            ) : (
              sections.map((section) => (
                <div key={section.id || '__ungrouped'} role="group" aria-label={typeof section.label === 'string' ? section.label : undefined}>
                  {section.label && (
                    <div className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-text-muted">
                      {section.label}
                    </div>
                  )}
                  {section.items.map((item) => {
                    const isActive = item.id === active;
                    return (
                      <div
                        key={item.id}
                        id={`${listId}-${item.id}`}
                        role="option"
                        aria-selected={isActive}
                        aria-disabled={item.disabled || undefined}
                        ref={(node) => {
                          if (node) itemRefs.current.set(item.id, node);
                          else itemRefs.current.delete(item.id);
                        }}
                        className={cn(
                          'flex cursor-default items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] text-text',
                          item.disabled && 'pointer-events-none opacity-50',
                          isActive && 'bg-surface-sunken',
                        )}
                        onMouseMove={() => !item.disabled && setActiveId(item.id)}
                        onClick={() => select(item)}
                      >
                        {item.icon && (
                          <span className="grid size-4 shrink-0 place-items-center text-text-muted [&_svg]:size-4">
                            {item.icon}
                          </span>
                        )}
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.shortcut && (
                          <kbd className="shrink-0 rounded border border-border-strong bg-surface px-1.5 py-0.5 font-sans text-[11px] text-text-muted">
                            {item.shortcut}
                          </kbd>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}