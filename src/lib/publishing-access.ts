import { useEffect, useState } from 'react';
import { getPostCapabilities, type PostCapabilities } from '@/api/posts';
import { useUser } from '@/redux/hooks/use-user';

/**
 * Post scheduling private beta. Shown only when the build flag VITE_PUBLISHING is 'true' AND the backend
 * reports capabilities.enabled on GET /posts/capabilities. With the flag off no request is made, so the
 * calendar, the "Schedule post" buttons and the sheet stay hidden. Same caching pattern as editor-access.ts.
 */

export type PublishingAccess = 'loading' | 'granted' | 'denied';

export interface PublishingState {
  access: PublishingAccess;
  capabilities: PostCapabilities | null;
}

/** Build flag: VITE_PUBLISHING=true. Off by default. */
export const isPublishingFlagOn = (value: unknown): boolean => String(value ?? '').trim().toLowerCase() === 'true';

/** Scheduling shows only when the build flag is on AND the server says publishing is enabled. */
export const publishingAvailable = (flagOn: boolean, caps: PostCapabilities | null | undefined): boolean =>
  flagOn && caps?.enabled === true;

export const publishingFlagOn = (): boolean => isPublishingFlagOn(import.meta.env.VITE_PUBLISHING);

let cached: { userId: string; caps: Promise<PostCapabilities | null> } | null = null;

const loadCapabilities = (userId: string): Promise<PostCapabilities | null> => {
  if (cached?.userId !== userId) {
    const caps = getPostCapabilities().catch(() => {
      if (cached?.caps === caps) cached = null;
      return null;
    });
    cached = { userId, caps };
  }
  return cached.caps;
};

/** For tests, and after a change that may alter what can be published. */
export const resetPublishingAccessCache = () => {
  cached = null;
};

export function usePublishingAccess(): PublishingState {
  const { id } = useUser();
  const userId = id ? String(id) : '';
  const flagOn = publishingFlagOn();
  const [state, setState] = useState<{ userId: string } & PublishingState>({ userId, access: 'loading', capabilities: null });

  useEffect(() => {
    if (!userId || !flagOn) return;
    let cancelled = false;
    void loadCapabilities(userId).then((caps) => {
      if (cancelled) return;
      setState({ userId, access: publishingAvailable(true, caps) ? 'granted' : 'denied', capabilities: caps });
    });
    return () => {
      cancelled = true;
    };
  }, [userId, flagOn]);

  if (!flagOn || !userId) return { access: 'denied', capabilities: null };
  return state.userId === userId ? { access: state.access, capabilities: state.capabilities } : { access: 'loading', capabilities: null };
}
