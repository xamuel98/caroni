import * as PopoverPrimitive from '@radix-ui/react-popover';
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import {
  useId,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { InputText } from '../InputText';
import { Spinner } from '../Spinner';
import { Flag } from './Flag';
import { countries, findCountry } from './countries';

export interface InputPhoneProps {
  /** National number (controlled). */
  value?: string;
  onChange?: (value: string) => void;
  /** Selected country, ISO 3166-1 alpha-2 (controlled). */
  country?: string;
  /** Initial country when uncontrolled. Defaults to `NG`. */
  defaultCountry?: string;
  onCountryChange?: (iso2: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Show a spinner at the end (e.g. while validating/formatting). */
  loading?: boolean;
  id?: string;
  name?: string;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

/**
 * A phone field with a country-code dropdown. The trigger shows the flag and
 * dial code; the list shows flag + country name + dial code with a search
 * filter. Flags are the local circle-flags set — no runtime fetch.
 */
export function InputPhone({
  value,
  onChange,
  country,
  defaultCountry = 'NG',
  onCountryChange,
  placeholder = 'Phone number',
  disabled,
  loading,
  id,
  name,
  className,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: InputPhoneProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [internal, setInternal] = useState(defaultCountry);

  const activeIso = country ?? internal;
  const active = findCountry(activeIso) ?? {
    iso2: activeIso.toUpperCase(),
    name: activeIso.toUpperCase(),
    dialCode: '',
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso2.toLowerCase().includes(q) ||
        c.dialCode.includes(q),
    );
  }, [query]);

  const pick = (iso2: string) => {
    if (country === undefined) setInternal(iso2);
    onCountryChange?.(iso2);
    setOpen(false);
  };

  const onListKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter': {
        const c = filtered[activeIndex];
        if (c) {
          event.preventDefault();
          pick(c.iso2);
        }
        break;
      }
    }
  };

  return (
    <div
      data-invalid={ariaInvalid ? '' : undefined}
      className={cn(
        'flex h-[34px] w-full items-center overflow-hidden rounded-sm border border-border-strong bg-surface',
        'transition duration-150 ease-out',
        'focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20',
        'data-[invalid]:border-danger data-[invalid]:ring-danger/20',
        disabled && 'opacity-50',
        className,
      )}
    >
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
      >
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={`Country: ${active.name} (+${active.dialCode}). Change country`}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            className={cn(
              'flex h-full shrink-0 items-center gap-1.5 pl-3 pr-2 text-[13px] text-text outline-none',
              'transition-colors duration-150 ease-out hover:bg-surface-sunken focus-visible:bg-surface-sunken',
              'disabled:cursor-not-allowed',
            )}
          >
            <Flag iso2={active.iso2} />
            <span className="tabular-nums text-text-secondary">+{active.dialCode}</span>
            <ChevronDownIcon
              className={cn(
                'size-3.5 text-text-muted transition-transform duration-150 ease-out',
                open && 'rotate-180',
              )}
            />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={6}
            className={cn(
              'z-50 w-64 rounded-md border border-border bg-surface-raised p-1 outline-none',
              'shadow-[0_8px_28px_-8px_rgb(16_16_20/0.24)] dark:shadow-[0_8px_28px_-8px_rgb(0_0_0/0.6)]',
              'origin-[var(--radix-popover-content-transform-origin)]',
              'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
            )}
          >
            <div className="p-1 pb-1.5">
              <InputText
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onListKeyDown}
                placeholder="Search country"
                startIcon={<MagnifyingGlassIcon />}
                className="h-8"
              />
            </div>

            <ul id={listId} role="listbox" className="max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-2 py-3 text-center text-[13px] text-text-muted">
                  No countries found
                </li>
              ) : (
                filtered.map((c, i) => {
                  const isSelected = c.iso2 === active.iso2;
                  return (
                    <li
                      key={c.iso2}
                      id={`${listId}-${c.iso2}`}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        'flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-text',
                        i === activeIndex && 'bg-surface-sunken',
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => pick(c.iso2)}
                    >
                      <Flag iso2={c.iso2} />
                      <span className="min-w-0 flex-1 truncate">{c.name}</span>
                      <span className="tabular-nums text-[12px] text-text-muted">
                        +{c.dialCode}
                      </span>
                      {isSelected && <CheckIcon className="size-4 shrink-0 text-accent" />}
                    </li>
                  );
                })
              )}
            </ul>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      <span className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />

      <input
        id={id}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] text-text placeholder:text-text-muted focus-visible:outline-none disabled:cursor-not-allowed md:text-[13px]"
      />
      {loading && <Spinner className="mr-3 size-4 shrink-0 text-text-muted" />}
    </div>
  );
}