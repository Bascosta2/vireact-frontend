import { useSubscription } from '@/redux/hooks/use-subscription';
import type { VideoViewId } from '@/lib/app-nav';
import { SCRIPT_IDEAS_PER_VIDEO, scriptAccessForPlan } from '@/lib/plan-limits';

export interface NavBadge {
  text: string;
  /** Read by screen readers and shown on hover. */
  title: string;
  locked: boolean;
}

interface BadgeInput {
  plan: string | null;
  loaded: boolean;
  chatMessagesUsed: number | null;
  chatMessagesLimit: number | null;
}

/**
 * Small plan hints next to the sidebar's video views: how many of the 10 scripts the plan opens, and the
 * coach messages left on Free. Nothing until the subscription has loaded, and nothing on plans with no limit to show.
 */
export function viewBadges({ plan, loaded, chatMessagesUsed, chatMessagesLimit }: BadgeInput): Record<VideoViewId, NavBadge | null> {
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
  if (plan === 'free' && chatMessagesLimit != null) {
    const left = Math.max(0, chatMessagesLimit - (chatMessagesUsed ?? 0));
    badges.coach = { text: `${left} left`, title: `${left} coach messages left this month`, locked: left === 0 };
  }
  return badges;
}

export function useViewBadges(): Record<VideoViewId, NavBadge | null> {
  const { plan, lastFetchedAt, chatMessagesUsedThisPeriod, chatMessagesPerMonthLimit } = useSubscription();
  return viewBadges({
    plan,
    loaded: lastFetchedAt != null,
    chatMessagesUsed: chatMessagesUsedThisPeriod,
    chatMessagesLimit: chatMessagesPerMonthLimit,
  });
}
