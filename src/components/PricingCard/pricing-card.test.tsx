import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PricingCard from './index';
import { PLAN_FEATURE_ROWS, TIERS, getTier, type TierId } from '@/config/tiers';

const html = (id: TierId) => renderToStaticMarkup(React.createElement(PricingCard, { tier: getTier(id)!, ctaText: 'Go' }));
const count = (s: string, needle: string) => s.split(needle).length - 1;

describe('plan cards', () => {
  it('show the exact Stripe prices', () => {
    expect(getTier('premium')!.priceMonthly).toBe(11.99);
    expect(getTier('pro')!.priceMonthly).toBe(19);
    expect(html('free')).toContain('$0');
    expect(html('premium')).toContain('$11.99');
    expect(html('premium')).toContain('/ month');
    expect(html('pro')).toContain('$19');
    expect(html('enterprise')).toContain('Custom');
  });

  it('give every plan the same rows, with a check or an X on each', () => {
    for (const tier of TIERS) {
      const out = html(tier.id);
      expect(count(out, 'Included: ') + count(out, 'Not included: ')).toBe(PLAN_FEATURE_ROWS.length);
    }
  });

  it('mark what each plan does not get', () => {
    expect(count(html('free'), 'Not included: ')).toBe(4); // advanced analytics, posting plan, priority support, team
    expect(count(html('premium'), 'Not included: ')).toBe(2); // advanced analytics, team
    expect(count(html('pro'), 'Not included: ')).toBe(1); // team
    expect(count(html('enterprise'), 'Not included: ')).toBe(0);
  });

  it('match the backend limits', () => {
    // vireact-backend/src/constants.js: LIFETIME_FREE_VIDEO_LIMIT, PLAN_LIMITS, EDITOR_LIMITS, STRATEGY_LIMITS
    expect(getTier('free')!.includes).toMatchObject({ analyses: '2 videos in total', chat: '20 messages / month', editor: '1 / month', strategy: false });
    expect(getTier('premium')!.includes).toMatchObject({ analyses: '15 / month', chat: '100 messages / month', editor: '5 / month', strategy: '3 / month' });
    expect(getTier('pro')!.includes).toMatchObject({ analyses: '30 / month', chat: '500 messages / month', editor: '20 / month', strategy: '10 / month', advanced: true });
  });
});
