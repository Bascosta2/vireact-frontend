import { useEffect, useState } from 'react';
import { getEditorUsage } from '@/api/editor';
import { useUser } from '@/redux/hooks/use-user';

/**
 * Editor tab private beta. The backend decides who has the editor (EDITOR_ENABLED / EDITOR_BETA_EMAILS)
 * and reports it as `available` on /editor/usage; the app hides the tab, its pages and the Home step
 * for everyone else. Logged-out pages (pricing, landing) use the build flag in editor-flag.ts instead.
 */

export type EditorAccess = 'loading' | 'granted' | 'denied';

// One request per signed-in account for the whole session; a failed request is retried on the next mount.
let cached: { userId: string; access: Promise<boolean> } | null = null;

const loadAccess = (userId: string): Promise<boolean> => {
  if (cached?.userId !== userId) {
    const access = getEditorUsage()
      .then((u) => u.available === true)
      .catch(() => {
        if (cached?.access === access) cached = null;
        return false;
      });
    cached = { userId, access };
  }
  return cached.access;
};

/** For tests. */
export const resetEditorAccessCache = () => {
  cached = null;
};

export function useEditorAccess(): EditorAccess {
  const { id } = useUser();
  const userId = id ? String(id) : '';
  const [state, setState] = useState<{ userId: string; access: EditorAccess }>({ userId, access: 'loading' });

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void loadAccess(userId).then((ok) => !cancelled && setState({ userId, access: ok ? 'granted' : 'denied' }));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!userId) return 'denied';
  return state.userId === userId ? state.access : 'loading';
}
