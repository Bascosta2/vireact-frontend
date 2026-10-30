import Axios from '@/api';
import type { LibraryHook } from '@/api/funnel';

type Envelope<T> = { data: T };

/** Public (non-member) hooks only: the endpoint serves approved + public items to anonymous visitors. */
export const fetchPublicHooks = async (limit = 6): Promise<LibraryHook[]> => {
  const res = await Axios.get<Envelope<{ items: Array<Partial<LibraryHook> & { locked?: boolean }> }>>('/library/items', {
    params: { type: 'hook' },
  });
  return (res.data.data.items ?? [])
    .filter((item): item is LibraryHook => !item.locked && !!item.slug && !!item.displayText)
    .slice(0, limit);
};
