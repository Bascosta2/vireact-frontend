import { useSubscription } from '@/redux/hooks/use-subscription';
import type { VideoViewId } from '@/lib/app-nav';
import { SCRIPT_IDEAS_PER_VIDEO, scriptAccessForPlan } from '@/lib/plan-limits';

export interface NavBadge {
  text: string;
  /** Read by screen readers and shown on hover. */
  title: string;
  locked: boolean;
}

/**
 * Small plan hint next to the sidebar's Scripts item: how many of the 10 scripts the plan opens.
 * Nothing until the subscription has loaded, and nothing on plans that open all 10.
 * (Coach messages left are shown under the chat box and on the report instead, so the
 * "Personal Video Coach" name keeps the full width of the sidebar.)
 */
export function viewBadges({ plan, loaded }: { plan: string | null; loaded: boolean }): Record<VideoViewId, NavBadge | null> {
  const badges: Record<VideoViewId, NavBadge | null> = { report: null, coach: null, scripts: null };
  if (!loaded) return badges;

  const open = scriptAccessForPlan(plan);
  if (open < SCRIPT_IDEAS_PER_VIDEO) {
    badges.scripts = {
      text: `${open}/${SCRIPT_IDEAS_PER_VIDEO}`,
      title: `${open} of ${SCRIPT_IDEAS_PER_VIDEO} full scripts open on your plan`,
      locked: true,
    };
  }
  return badges;
}

export function useViewBadges(): Record<VideoViewId, NavBadge | null> {
  const { plan, lastFetchedAt } = useSubscription();
  return viewBadges({ plan, loaded: lastFetchedAt != null });
}
