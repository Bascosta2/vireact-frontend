import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MenuItem = { id: string; label: string; icon?: ReactNode; onSelect: () => void; danger?: boolean; disabled?: boolean };

/** Menu button pattern: arrow keys move, Escape closes and returns focus to the trigger. */
export function MoreActionsMenu({ items, label = 'More actions' }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const enabled = items.filter((i) => !i.disabled);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();
    const onDown = (e: MouseEvent) => !wrapRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    const last = enabled.length - 1;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      itemRefs.current[current >= last ? 0 : current + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      itemRefs.current[current <= 0 ? last : current - 1]?.focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="app-focus inline-flex h-11 w-11 items-center justify-center rounded-lg text-fg-muted hover:bg-white/5 hover:text-fg"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          onKeyDown={onMenuKey}
          className="app-glass absolute bottom-full right-0 z-30 mb-2 min-w-[180px] rounded-xl p-1"
        >
          {enabled.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                'app-focus flex h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm',
                item.danger ? 'text-danger hover:bg-danger/10' : 'text-fg hover:bg-white/5'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
