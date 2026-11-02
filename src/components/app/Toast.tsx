import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ToastInput = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Runs once when the toast goes away without its action being used. */
  onExpire?: () => void;
  durationMs?: number;
};

type ToastItem = ToastInput & { id: number };

type ToastContextValue = { show: (toast: ToastInput) => number; dismiss: (id: number) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

const MIN_DURATION_MS = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const itemsRef = useRef<ToastItem[]>([]);
  itemsRef.current = items;
  const nextId = useRef(1);

  const remove = useCallback((id: number, expired: boolean) => {
    const item = itemsRef.current.find((t) => t.id === id);
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
    if (expired) item?.onExpire?.();
  }, []);

  const show = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++;
      setItems((prev) => [...prev, { ...toast, id }]);
      timers.current.set(id, setTimeout(() => remove(id, true), Math.max(MIN_DURATION_MS, toast.durationMs ?? MIN_DURATION_MS)));
      return id;
    },
    [remove]
  );

  // Pending expiries (e.g. a queued delete) still run when the provider unmounts.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      itemsRef.current.forEach((t) => t.onExpire?.());
    };
  }, []);

  const value = useMemo(() => ({ show, dismiss: (id: number) => remove(id, true) }), [show, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 left-4 right-4 z-[300] flex flex-col items-start gap-2 md:bottom-6 md:left-6 md:right-auto"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-surface-raised px-4 py-3 text-sm text-fg shadow-lg shadow-black/40"
          >
            <span className="flex-1">{t.message}</span>
            {t.actionLabel && (
              <button
                type="button"
                className="app-focus rounded-md px-2 py-1 font-semibold text-accent hover:bg-accent-tint"
                onClick={() => {
                  t.onAction?.();
                  remove(t.id, false);
                }}
              >
                {t.actionLabel}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              className="app-focus -mr-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-white/5 hover:text-fg"
              onClick={() => remove(t.id, true)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
