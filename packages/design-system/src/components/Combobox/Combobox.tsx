import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import {
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { InputText } from '../InputText';
import { Spinner } from '../Spinner';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface ComboboxBaseProps {
  options: ComboboxOption[];
  onQueryChange?: (query: string) => void;
  loading?: boolean;
  loadingMessage?: ReactNode;
  /** Show a clear button when something is selected. */
  clearable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;
  id?: string;
  disabled?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export type ComboboxProps =
  | (ComboboxBaseProps & { multiple?: false; value?: string; onChange?: (value: string) => void })
  | (ComboboxBaseProps & { multiple: true; value?: string[]; onChange?: (value: string[]) => void });

const MAX_CHIPS = 3;

export function Combobox(props: ComboboxProps) {
  const {
    options,
    onQueryChange,
    loading = false,
    loadingMessage = 'Searching…',
    clearable = false,
    placeholder = 'Select…',
    searchPlaceholder = 'Search...',
    emptyMessage = 'No results',
    id,
    disabled,
    className,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
  } = props;
  const multiple = props.multiple ?? false;
  const value = props.value;
  const onChange = props.onChange as ((value: string | string[]) => void) | undefined;
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedValues = useMemo(
    () => (multiple ? (Array.isArray(value) ? value : value ? [value] : []) : value ? [value as string] : []),
    [multiple, value],
  );
  const selectedOptions = selectedValues
    .map((v) => options.find((o) => o.value === v))
    .filter((o): o is ComboboxOption => Boolean(o));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);
  useEffect(() => setActiveIndex(0), [query, open]);

  const toggle = (option: ComboboxOption) => {
    if (option.disabled) return;
    if (multiple) {
      const next = selectedValues.includes(option.value)
        ? selectedValues.filter((v) => v !== option.value)
        : [...selectedValues, option.value];
      onChange?.(next);
    } else {
      onChange?.(option.value);
      setOpen(false);
    }
  };

  const clear = () => {
    onChange?.(multiple ? [] : '');
    setQuery('');
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(filtered.length - 1);
        break;
      case 'Enter': {
        const option = filtered[activeIndex];
        if (option) {
          event.preventDefault();
          toggle(option);
        }
        break;
      }
      case 'Escape':
        setOpen(false);
        break;
    }
  };

  const hasValue = selectedOptions.length > 0;
  const activeOption = open ? filtered[activeIndex] : undefined;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <div className={cn('relative w-full', className)}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-haspopup="listbox"
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            data-placeholder={hasValue ? undefined : ''}
            className={cn(
              'flex h-[34px] w-full items-center gap-2 rounded-sm border border-border-strong bg-surface px-3 text-left text-[13px] text-text',
              'data-[placeholder]:text-text-muted',
              'transition duration-150 ease-out',
              'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'aria-invalid:border-danger aria-invalid:ring-danger/20',
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-1.5">
              {multiple && hasValue ? (
                <>
                  {selectedOptions.slice(0, MAX_CHIPS).map((o) => (
                    <span
                      key={o.value}
                      className="inline-flex max-w-[8rem] items-center rounded-sm bg-surface-sunken px-1.5 py-0.5 text-[12px] text-text"
                    >
                      <span className="truncate">{o.label}</span>
                    </span>
                  ))}
                  {selectedOptions.length > MAX_CHIPS && (
                    <span className="shrink-0 text-[12px] text-text-muted">
                      +{selectedOptions.length - MAX_CHIPS}
                    </span>
                  )}
                </>
              ) : (
                <span className="truncate">{hasValue ? selectedOptions[0]!.label : placeholder}</span>
              )}
            </span>

            {loading ? (
              <Spinner className="size-4 shrink-0 text-text-muted" />
            ) : (
              <ChevronDownIcon
                className={cn(
                  'size-4 shrink-0 text-text-muted transition-transform duration-150 ease-out',
                  open && 'rotate-180',
                )}
              />
            )}
          </button>
        </PopoverPrimitive.Trigger>

        {clearable && hasValue && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              clear();
            }}
            className="absolute right-8 top-1/2 grid size-4 -translate-y-1/2 place-items-center rounded-full text-text-muted transition-colors duration-150 ease-out hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <XMarkIcon className="size-4" />
          </button>
        )}
      </div>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className={cn(
            'z-50 w-[var(--radix-popover-trigger-width)] rounded-md border border-border bg-surface-raised p-1 outline-none',
            'shadow-[0_8px_28px_-8px_rgb(16_16_20/0.24)] dark:shadow-[0_8px_28px_-8px_rgb(0_0_0/0.6)]',
            'origin-[var(--radix-popover-content-transform-origin)]',
            'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
          )}
        >
          <div className="p-1 pb-1.5">
            <InputText
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                onQueryChange?.(event.target.value);
              }}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeOption ? `${listId}-${activeOption.value}` : undefined}
              placeholder={searchPlaceholder}
              startIcon={loading ? <Spinner className="text-accent" /> : <MagnifyingGlassIcon />}
              className="h-8"
            />
          </div>

          <ul id={listId} role="listbox" aria-multiselectable={multiple} className="max-h-60 overflow-y-auto">
            {loading && filtered.length === 0 ? (
              <li role="presentation" className="flex items-center justify-center gap-2 px-2 py-3 text-[13px] text-text-muted">
                <Spinner className="size-4" />
                <span>{loadingMessage}</span>
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-2 py-3 text-center text-[13px] text-text-muted">{emptyMessage}</li>
            ) : (
              filtered.map((option, i) => {
                const isSelected = selectedValues.includes(option.value);
                const active = i === activeIndex && !option.disabled;
                return (
                  <li
                    key={option.value}
                    id={`${listId}-${option.value}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    className={cn(
                      'flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-text',
                      option.disabled && 'pointer-events-none opacity-50',
                      active && 'bg-surface-sunken',
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => !option.disabled && setActiveIndex(i)}
                    onClick={() => toggle(option)}
                  >
                    {multiple && (
                      <span
                        className={cn(
                          'grid size-4 shrink-0 place-items-center rounded-[4px] border',
                          isSelected ? 'border-accent bg-accent text-accent-fg' : 'border-border-strong',
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && <CheckIcon className="size-3" />}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="block truncate text-[12px] text-text-muted">{option.description}</span>
                      )}
                    </span>
                    {!multiple && isSelected && <CheckIcon className="size-4 shrink-0 text-accent" />}
                  </li>
                );
              })
            )}
          </ul>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}