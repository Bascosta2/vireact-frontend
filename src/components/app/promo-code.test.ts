import { describe, expect, it } from 'vitest';
import { promoSummary } from '@/lib/promo';
import { getCardCta } from '@/pages/User/SubscriptionPlans/card-cta';
import { getTier } from '@/config/tiers';

describe('promo plans', () => {
  it('describes the promo plan', () => {
    expect(promoSummary({ plan: 'pro', endsAt: null, lifetime: true })).toBe('Pro for life');
    expect(promoSummary({ plan: 'premium', endsAt: '2026-12-17T12:00:00Z', lifetime: false })).toMatch(/^Premium until /);
  });

  it('plan cards for a promo plan with nothing billed: higher plan is a checkout, lower ones are included', () => {
    const premiumPromo = { unbilled: true, lifetime: false };
    const pro = getCardCta('premium', getTier('pro')!, { eligible: false, days: 7 }, premiumPromo);
    expect(pro.action).toEqual({ kind: 'checkout', plan: 'pro', trial: false });
    expect(getCardCta('premium', getTier('premium')!, undefined, premiumPromo).label).toBe('Current Plan (promo)');
    expect(getCardCta('premium', getTier('free')!, undefined, premiumPromo)).toMatchObject({ label: 'Included in your plan', disabled: true });

    const goat = { unbilled: true, lifetime: true };
    const premium = getCardCta('pro', getTier('premium')!, undefined, goat);
    expect(premium).toMatchObject({ disabled: true, tooltip: 'Your promo plan never ends' });
    expect(getCardCta('pro', getTier('enterprise')!, undefined, goat).action).toEqual({ kind: 'contact' });
  });

  it('paid Stripe plans keep the normal switch buttons', () => {
    expect(getCardCta('premium', getTier('pro')!).action).toEqual({ kind: 'switch', plan: 'pro' });
  });
});
