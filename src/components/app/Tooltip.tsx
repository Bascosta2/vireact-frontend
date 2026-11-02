import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Hover and keyboard-focus tooltip. The trigger is focusable so keyboard users can read it too. */
export function Tooltip({
  content,
  children,
  className,
  triggerClassName,
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className={cn('relative inline-flex min-w-0', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        tabIndex={0}
        aria-describedby={id}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className={cn('app-focus min-w-0 rounded', triggerClassName)}
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-0 z-30 mb-2 w-max max-w-[260px] rounded-lg border border-line bg-surface-raised px-3 py-2 text-xs text-fg shadow-lg shadow-black/40 transition-opacity duration-100',
          open ? 'opacity-100' : 'opacity-0'
        )}
      >
        {content}
      </span>
    </span>
  );
}
