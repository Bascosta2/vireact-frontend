import { useEffect, useState } from 'react';

interface AdminData<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Loads one read-only admin endpoint; refetches when `deps` change. */
export function useAdminData<T>(load: () => Promise<T>, deps: unknown[] = []): AdminData<T> {
  const [state, setState] = useState<AdminData<T>>({ data: null, error: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    load()
      .then((data) => { if (!cancelled) setState({ data, error: null, loading: false }); })
      .catch(() => { if (!cancelled) setState({ data: null, error: 'Could not load this section.', loading: false }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export const CARD = 'rounded-xl border border-line bg-white/[0.02] p-4';

/** A value that follows `value` after it has stopped changing for `delayMs`. */
export function useDebounced<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
