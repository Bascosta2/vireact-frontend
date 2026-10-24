import { useCallback } from 'react';
import Axios from '@/api';
import { isFunnelV2Enabled } from '@/funnel/cta';
import { safePostAuthPath } from '@/funnel/redirect';

/**
 * Post-auth destination (plan §7): asks /auth/me for the access state and
 * upload status the backend resolved. Off (or on any error) it is /dashboard,
 * the pre-funnel behavior.
 */
export const resolvePostAuthPath = async (fallback = '/dashboard'): Promise<string> => {
  if (!isFunnelV2Enabled()) return fallback;
  try {
    const res = await Axios.get<{ data: { onboarding?: { nextPath?: string } } }>('/auth/me');
    return safePostAuthPath(res.data?.data?.onboarding?.nextPath, fallback);
  } catch {
    return fallback;
  }
};

export const useFunnelRedirect = () =>
  useCallback(async (fallback = '/dashboard') => {
    window.location.href = await resolvePostAuthPath(fallback);
  }, []);
