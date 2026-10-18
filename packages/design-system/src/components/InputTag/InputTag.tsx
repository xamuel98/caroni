import { XMarkIcon } from '@heroicons/react/20/solid';
import {
  forwardRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { cn } from '../../lib/cn';

export interface InputTagProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  /** Maximum number of tags. */
  max?: number;
  /** Return false to reject a candidate tag. */
  validate?: (tag: string) => boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}

/** A token field: type a value and press Enter (or comma) to add a tag. */
export const InputTag = forwardRef<HTMLInputElement, InputTagProps>(
  ({ value = [], onChange, placeholder = 'Add a tag…', max, validate, disabled, id, className, ...aria }, ref) => {
    const [input, setInput] = useState('');
    const atMax = max != null && value.length >= max;

    const add = (raw: string) => {
      const tag = raw.trim();
      if (!tag || value.includes(tag) || (max != null && value.length >= max)) return;
      if (validate && !validate(tag)) return;
      onChange?.([...value, tag]);
      setInput('');
    };

    const remove = (index: number) => onChange?.(value.filter((_, i) => i !== index));

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        add(input);
      } else if (event.key === 'Backspace' && input === '' && value.length > 0) {
        remove(value.length - 1);
      }
    };

    const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
      const text = event.clipboardData.getData('text');
      if (!/[,\n]/.test(text)) return;
      event.preventDefault();
      text.split(/[,\n]/).forEach(add);
    };

    return (
      <div
        className={cn(
          'flex min-h-[34px] w-full flex-wrap items-center gap-1.5 rounded-sm border border-border-strong bg-surface px-2 py-1 text-[13px]',
          'transition duration-150 ease-out',
          'focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex max-w-full items-center gap-1 rounded-sm bg-surface-sunken py-0.5 pl-2 pr-1 text-text"
          >
            <span className="truncate">{tag}</span>
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              disabled={disabled}
              onClick={() => remove(index)}
              className="grid size-4 shrink-0 place-items-center rounded-sm text-text-muted transition-colors duration-150 ease-out hover:bg-border hover:text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
            >
              <XMarkIcon className="size-3.5" />
            </button>
          </span>
        ))}
        <input
          ref={ref}
          id={id}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => add(input)}
          disabled={disabled || atMax}
          placeholder={value.length === 0 ? placeholder : undefined}
          className="h-6 min-w-[6rem] flex-1 bg-transparent text-text outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
          {...aria}
        />
      </div>
    );
  },
);
InputTag.displayName = 'InputTag';