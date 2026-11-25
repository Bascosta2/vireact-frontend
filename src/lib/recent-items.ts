import { useSyncExternalStore } from 'react';

/** A video or page the creator opened, newest first. Kept in this browser only. */
export interface RecentItem {
  id: string;
  title: string;
  href: string;
  at: number;
  pinned?: boolean;
}

const KEY = 'vireact_recent_items_v1';
const MAX_RECENT = 6;
const MAX_PINNED = 5;
const listeners = new Set<() => void>();
let cache: RecentItem[] | null = null;

const read = (): RecentItem[] => {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    cache = Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.id === 'string' && typeof x.href === 'string') : [];
  } catch {
    cache = [];
  }
  return cache;
};

const write = (items: RecentItem[]) => {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // private window or full storage: keep it for this session only
  }
  listeners.forEach((l) => l());
};

/** Remember that something was opened. Pinned items keep their place. */
export function rememberRecent(item: Omit<RecentItem, 'at'>) {
  const items = read();
  const existing = items.find((x) => x.id === item.id);
  const next: RecentItem = { ...item, at: Date.now(), pinned: existing?.pinned };
  if (existing?.pinned) {
    write(items.map((x) => (x.id === item.id ? next : x)));
    return;
  }
  const rest = items.filter((x) => x.id !== item.id);
  const pinned = rest.filter((x) => x.pinned);
  const recent = rest.filter((x) => !x.pinned);
  write([...pinned, next, ...recent.slice(0, MAX_RECENT - 1)]);
}

export function togglePinned(id: string) {
  const items = read();
  const target = items.find((x) => x.id === id);
  if (!target) return;
  if (!target.pinned && items.filter((x) => x.pinned).length >= MAX_PINNED) return;
  write(items.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)));
}

export function forgetRecent(id: string) {
  write(read().filter((x) => x.id !== id));
}

/** Rename an item everywhere it is remembered (after a video is renamed). */
export function renameRecent(id: string, title: string) {
  const items = read();
  if (!items.some((x) => x.id === id)) return;
  write(items.map((x) => (x.id === id ? { ...x, title } : x)));
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener('storage', onStorage);
  };
};

/** Pinned first, then the most recently opened. */
export function useRecentItems(): RecentItem[] {
  return useSyncExternalStore(subscribe, read, () => []);
}

/** Test hook. */
export const resetRecentForTests = () => {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};
