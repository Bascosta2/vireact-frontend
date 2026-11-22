import { useEffect, useState } from 'react';
import { getAccounts } from '@/api/accounts';
import { useUser } from '@/redux/hooks/use-user';

/**
 * Accounts tab private beta, same pattern as the editor (editor-access.ts). The backend decides
 * (ACCOUNTS_ENABLED / ACCOUNTS_BETA_EMAILS) and reports it as `available` on GET /accounts.
 */

export type AccountsAccess = 'loading' | 'granted' | 'denied';

let cached: { userId: string; access: Promise<boolean> } | null = null;

const loadAccess = (userId: string): Promise<boolean> => {
  if (cached?.userId !== userId) {
    const access = getAccounts()
      .then((a) => a.available === true)
      .catch(() => {
        if (cached?.access === access) cached = null;
        return false;
      });
    cached = { userId, access };
  }
  return cached.access;
};

/** For tests. */
export const resetAccountsAccessCache = () => {
  cached = null;
};

export function useAccountsAccess(): AccountsAccess {
  const { id } = useUser();
  const userId = id ? String(id) : '';
  const [state, setState] = useState<{ userId: string; access: AccountsAccess }>({ userId, access: 'loading' });

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
