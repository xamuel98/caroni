import {
  Fragment,
  forwardRef,
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { cn } from '../../lib/cn';

export interface InputOTPProps {
  /** Number of boxes. */
  length: number;
  value?: string;
  onChange?: (value: string) => void;
  /** Mask the characters (password-style dots). */
  mask?: boolean;
  /** Split the boxes into groups, e.g. `[3, 3]` renders 3 boxes, a dash, 3 boxes. */
  groups?: number[];
  /** Separator shown between groups. Defaults to `-`. */
  separator?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Accessible name for the group. Defaults to `One-time code`. */
  'aria-label'?: string;
  className?: string;
}

const boxClass =
  'size-10 shrink-0 border border-border-strong bg-surface text-center text-[16px] tabular-nums text-text md:text-[14px] transition duration-150 ease-out focus-visible:z-10 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50';

/** A segmented one-time-code field. */
export const InputOTP = forwardRef<HTMLDivElement, InputOTPProps>(
  (
    { length, value = '', onChange, mask = false, groups, separator = '-', disabled, autoFocus, className, 'aria-label': ariaLabel = 'One-time code' },
    ref,
  ) => {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const chars = Array.from({ length }, (_, i) => value[i] ?? '');

    useEffect(() => {
      if (autoFocus) inputs.current[0]?.focus();
    }, [autoFocus]);

    const setChar = (index: number, char: string) => {
      const next = [...chars];
      next[index] = char;
      onChange?.(next.join(''));
    };

    const fill = (start: number, text: string) => {
      const clean = text.replace(mask ? /\D/g : /[^a-zA-Z0-9]/g, '').slice(0, length - start);
      if (!clean) return;
      const next = [...chars];
      for (let i = 0; i < clean.length; i += 1) next[start + i] = clean[i] ?? '';
      onChange?.(next.join(''));
      const focusAt = Math.min(start + clean.length, length - 1);
      inputs.current[focusAt]?.focus();
    };

    const onInput = (index: number, raw: string) => {
      const char = raw.slice(-1);
      if (!char) {
        setChar(index, '');
        return;
      }
      setChar(index, char);
      if (index < length - 1) inputs.current[index + 1]?.focus();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.key === 'Backspace') {
        event.preventDefault();
        if (chars[index]) setChar(index, '');
        else if (index > 0) {
          setChar(index - 1, '');
          inputs.current[index - 1]?.focus();
        }
      } else if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault();
        inputs.current[index - 1]?.focus();
      } else if (event.key === 'ArrowRight' && index < length - 1) {
        event.preventDefault();
        inputs.current[index + 1]?.focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        inputs.current[0]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        inputs.current[length - 1]?.focus();
      }
    };

    const onPaste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
      event.preventDefault();
      fill(index, event.clipboardData.getData('text'));
    };

    const box = (index: number, extra?: string) => (
      <input
        key={index}
        ref={(node) => {
          inputs.current[index] = node;
        }}
        value={chars[index]}
        onChange={(event) => onInput(index, event.target.value)}
        onKeyDown={(event) => onKeyDown(event, index)}
        onPaste={(event) => onPaste(event, index)}
        onFocus={(event) => event.target.select()}
        type={mask ? 'password' : 'text'}
        inputMode={mask ? 'numeric' : 'text'}
        maxLength={1}
        disabled={disabled}
        aria-label={`Character ${index + 1} of ${length}`}
        className={cn(boxClass, extra)}
      />
    );

    const useGroups = groups && groups.length > 0 && groups.reduce((a, b) => a + b, 0) === length;

    return (
      <div ref={ref} role="group" aria-label={ariaLabel} className={cn('flex items-center gap-2', className)}>
        {useGroups ? (
          (() => {
            let index = 0;
            return groups!.map((size, gi) => {
              const boxes = Array.from({ length: size }, (_, k) => {
                const i = index++;
                const rounding =
                  size === 1
                    ? 'rounded-sm'
                    : k === 0
                      ? 'rounded-l-sm rounded-r-none'
                      : k === size - 1
                        ? '-ml-px rounded-l-none rounded-r-sm'
                        : '-ml-px rounded-none';
                return box(i, rounding);
              });
              return (
                <Fragment key={gi}>
                  {gi > 0 && <span className="mx-1 text-text-muted">{separator}</span>}
                  <div className="flex items-center">{boxes}</div>
                </Fragment>
              );
            });
          })()
        ) : (
          <div className="flex items-center gap-2">{Array.from({ length }, (_, i) => box(i, 'rounded-sm'))}</div>
        )}
      </div>
    );
  },
);
InputOTP.displayName = 'InputOTP';