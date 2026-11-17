import { useSubscription } from '@/redux/hooks/use-subscription';

export type Quota = {
  used: number;
  limit: number | null;
  remaining: number | null;
  resetsOn: string | null;
  plan: string | null;
  loaded: boolean;
  /** Free plan: the allowance is for the life of the account and does not renew monthly. */
  lifetime: boolean;
};

/**
 * Analysis quota from the subscription slice. `limit: null` means unlimited.
 * Paid plans count per billing period; the Free plan has a fixed number of analyses in total.
 */
export const useQuota = (): Quota => {
  const { videosUsedThisPeriod, videosPerMonthLimit, currentPeriodEnd, plan, lastFetchedAt, lifetimeFreeVideosUsed, lifetimeFreeVideoLimit } = useSubscription();
  const lifetime = plan === 'free' && lifetimeFreeVideoLimit != null;
  const limit = lifetime ? lifetimeFreeVideoLimit : videosPerMonthLimit ?? null;
  const rawUsed = lifetime ? lifetimeFreeVideosUsed ?? 0 : videosUsedThisPeriod ?? 0;
  const used = limit == null ? rawUsed : Math.min(rawUsed, limit);
  return {
    used,
    limit,
    remaining: limit == null ? null : Math.max(0, limit - used),
    resetsOn: lifetime ? null : currentPeriodEnd ?? null,
    plan: plan ?? null,
    loaded: lastFetchedAt != null,
    lifetime,
  };
};

export const formatResetDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
