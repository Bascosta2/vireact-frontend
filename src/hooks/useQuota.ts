import { useSubscription } from '@/redux/hooks/use-subscription';

export type Quota = { used: number; limit: number | null; remaining: number | null; resetsOn: string | null; plan: string | null; loaded: boolean };

/** Monthly analysis quota from the subscription slice. `limit: null` means unlimited. */
export const useQuota = (): Quota => {
  const { videosUsedThisPeriod, videosPerMonthLimit, currentPeriodEnd, plan, lastFetchedAt } = useSubscription();
  const used = videosUsedThisPeriod ?? 0;
  const limit = videosPerMonthLimit ?? null;
  return {
    used,
    limit,
    remaining: limit == null ? null : Math.max(0, limit - used),
    resetsOn: currentPeriodEnd ?? null,
    plan: plan ?? null,
    loaded: lastFetchedAt != null,
  };
};

export const formatResetDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
