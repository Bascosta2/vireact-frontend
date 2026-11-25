import { refreshThumbnails } from '@/api/video';

/**
 * Thumbnail links expire. When one fails to load, ask the backend for a fresh link (batched across every
 * card on the page, once per video per visit), and fall back to a calm tile instead of a broken image.
 */

const asked = new Map<string, Promise<string | null>>();
let queue: { id: string; resolve: (url: string | null) => void }[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
const BATCH = 24;

const flush = () => {
  timer = null;
  const batch = queue.splice(0, BATCH);
  if (queue.length) timer = setTimeout(flush, 0);
  refreshThumbnails(batch.map((b) => b.id))
    .then((urls) => batch.forEach((b) => b.resolve(urls[b.id] ?? null)))
    .catch(() => batch.forEach((b) => b.resolve(null)));
};

export function freshThumbnail(id: string): Promise<string | null> {
  const known = asked.get(id);
  if (known) return known;
  const p = new Promise<string | null>((resolve) => {
    queue.push({ id, resolve });
    if (!timer) timer = setTimeout(flush, 150);
  });
  asked.set(id, p);
  return p;
}

/** Test hook. */
export const resetThumbRefreshForTests = () => {
  asked.clear();
  queue = [];
  if (timer) clearTimeout(timer);
  timer = null;
};
