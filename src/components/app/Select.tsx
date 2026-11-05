import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SelectOption = { value: string; label: string };

type SelectProps = {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
};

/** Custom listbox. Arrow keys move, Enter/Space pick, Escape closes. */
export function Select({ id, label, value, options, onChange, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const i = Math.max(0, options.findIndex((o) => o.value === value));
    optionRefs.current[i]?.focus();
    const onDown = (e: MouseEvent) => !wrapRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, options, value]);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const pick = (next: string) => {
    onChange(next);
    close();
  };

  const onListKey = (e: KeyboardEvent) => {
    const current = optionRefs.current.findIndex((el) => el === document.activeElement);
    const last = options.length - 1;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      optionRefs.current[current >= last ? 0 : current + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      optionRefs.current[current <= 0 ? last : current - 1]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      optionRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      optionRefs.current[last]?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={cn('relative min-w-0 flex-1 sm:flex-none', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="app-focus app-glass flex h-11 w-full min-w-[9.5rem] items-center justify-between gap-2 rounded-lg px-3 text-left text-sm text-fg"
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-fg-subtle transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${id}-${selected?.value}`}
          onKeyDown={onListKey}
          className="app-glass absolute top-full right-0 z-30 mt-2 min-w-full overflow-hidden rounded-xl p-1"
        >
          {options.map((opt, i) => {
            const active = opt.value === value;
            return (
              <li key={opt.value} role="none">
                <button
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  id={`${id}-${opt.value}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  tabIndex={-1}
                  onClick={() => pick(opt.value)}
                  className={cn(
                    'app-focus flex h-10 w-full items-center rounded-lg px-3 text-left text-sm',
                    active ? 'bg-accent-tint text-fg' : 'text-fg-muted hover:bg-white/5 hover:text-fg'
                  )}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
