import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A button that opens a small panel. Closes on outside click and Escape (focus returns to the button).
 * `side` places the panel: under the button (aligned left or right), or beside it (sidebar rail).
 */
export function Popover({
  trigger,
  label,
  children,
  side = 'bottom-end',
  className,
  buttonClassName,
  panelClassName,
  onOpenChange,
}: {
  trigger: (open: boolean) => ReactNode;
  label: string;
  children: (close: () => void) => ReactNode;
  side?: 'bottom-start' | 'bottom-end' | 'right-start' | 'top-start';
  className?: string;
  buttonClassName?: string;
  panelClassName?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpenState] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const setOpen = (v: boolean) => {
    setOpenState(v);
    onOpenChange?.(v);
  };
  const close = () => {
    setOpen(false);
    btnRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        className={cn('app-focus', buttonClassName)}
      >
        {trigger(open)}
      </button>
      {open && (
        <div
          id={panelId}
          className={cn(
            'app-glass absolute z-50 rounded-xl border border-line p-1 shadow-xl shadow-black/50',
            side === 'bottom-start' && 'left-0 top-full mt-2',
            side === 'bottom-end' && 'right-0 top-full mt-2',
            side === 'right-start' && 'left-full top-0 ml-2',
            side === 'top-start' && 'bottom-full left-0 mb-2',
            panelClassName
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}
