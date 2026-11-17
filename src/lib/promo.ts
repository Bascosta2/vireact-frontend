import type { PromoInfo } from '@/api/subscription';

const PLAN_NAMES: Record<string, string> = { free: 'Free', premium: 'Premium', pro: 'Pro', enterprise: 'Enterprise' };

const longDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

/** "Pro for life" or "Premium until December 17, 2026". */
export const promoSummary = (promo: Pick<PromoInfo, 'plan' | 'endsAt' | 'lifetime'>): string =>
  promo.lifetime || !promo.endsAt
    ? `${PLAN_NAMES[promo.plan] ?? promo.plan} for life`
    : `${PLAN_NAMES[promo.plan] ?? promo.plan} until ${longDate(promo.endsAt)}`;
