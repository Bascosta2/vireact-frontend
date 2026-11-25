import { describe, expect, it } from 'vitest';
import { isLimitError, limitPath, planLocks, trialEndLabel, trialHeadline } from './plan-limits';
import { getCardCta } from '@/pages/User/SubscriptionPlans/card-cta';
import { disconnectRequestConfig, returnErrorMessage } from '@/api/accounts';
import { getTier } from '@/config/tiers';
import { activeSubscriptions, ageLabel, ownerConsoleUrl, planRows, promoLength } from '@/api/admin';

const err = (status: number, message: string, code?: string) => ({ response: { status, data: { message, data: code ? { code } : null } } });

describe('plan limits', () => {
  it('sends creators who hit a limit to the trial offer with the reason', () => {
    expect(limitPath('videos')).toBe('/trial?reason=videos');
    expect(limitPath('chat')).toBe('/trial?reason=chat');
  });

  it('recognises the backend limit answers and nothing else', () => {
    expect(isLimitError(err(403, 'Chat message limit reached. You have used 5/5 messages this month.', 'CHAT_LIMIT'))).toBe(true);
    expect(isLimitError(err(403, 'Nope', 'VIDEO_LIMIT'))).toBe(true);
    expect(isLimitError(err(403, 'Free trial limit reached. Upgrade to continue analyzing videos.'))).toBe(true);
    expect(isLimitError(err(403, 'Please verify your email'))).toBe(false);
    expect(isLimitError(err(429, 'Rate limit'))).toBe(false);
    expect(isLimitError(new Error('network'))).toBe(false);
  });

  it('works out the first charge date', () => {
    expect(trialEndLabel(7, new Date(2026, 10, 17))).toBe(new Date(2026, 10, 24).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  });
});

describe('what is locked on each plan', () => {
  it('Free: Advanced Analytics and the posting plan; Premium: Advanced Analytics; Pro and up: nothing', () => {
    expect(planLocks('free').map((l) => l.feature)).toEqual(['Advanced Analytics', '8 of the 10 full scripts', '2-week AI posting plan']);
    expect(planLocks('premium').map((l) => l.feature)).toEqual(['Advanced Analytics', '4 of the 10 full scripts']);
    expect(planLocks('pro')).toEqual([]);
    expect(planLocks('enterprise')).toEqual([]);
    expect(planLocks(null)).toEqual([]);
  });
});

describe('free trial offer', () => {
  it('explains why the creator landed on the page', () => {
    expect(trialHeadline('videos', 7).title).toBe("You've used all your free analyses");
    expect(trialHeadline('chat', 7).title).toBe("You've used this month's free coach messages");
    expect(trialHeadline(null, 7).title).toBe('Try Vireact free for 7 days');
    expect(trialHeadline('videos', 14).body).toContain('14-day free trial');
  });

  it('plan cards start the trial only for accounts that can still take it', () => {
    const pro = getTier('pro')!;
    const eligible = getCardCta('free', pro, { eligible: true, days: 7 });
    expect(eligible.label).toBe('Start 7-day free trial');
    expect(eligible.action).toEqual({ kind: 'checkout', plan: 'pro', trial: true });
    expect(eligible.priceNote).toContain('7 days free');

    const used = getCardCta('free', pro, { eligible: false, days: 7 });
    expect(used.action).toEqual({ kind: 'checkout', plan: 'pro', trial: false });
    expect(used.priceNote).toBeUndefined();

    // Paying customers switch plans; the trial never applies.
    expect(getCardCta('premium', pro, { eligible: false, days: 7 }).action).toEqual({ kind: 'switch', plan: 'pro' });
    expect(getCardCta('free', getTier('free')!, { eligible: true, days: 7 }).label).toBe('Current Plan');
  });

  it('maps account sign-in error codes to plain messages', () => {
    expect(returnErrorMessage('still_deleting')).toContain("still removing your previous data");
    expect(returnErrorMessage('denied')).toContain('cancelled');
    expect(returnErrorMessage('something_new')).toBe(returnErrorMessage('failed'));
    expect(returnErrorMessage(null)).toBe(returnErrorMessage('failed'));
  });

  it('only asks the backend to delete copied numbers when the box is ticked', () => {
    expect(disconnectRequestConfig(true)).toEqual({ params: { deleteData: true } });
    expect(disconnectRequestConfig(false)).toEqual({});
  });
});

describe('admin dashboard helpers', () => {
  it('counts paid plans and sorts the breakdown', () => {
    const plans = { free: 10, pro: 2, premium: 3 };
    expect(activeSubscriptions(plans)).toBe(5);
    expect(planRows(plans).map((r) => r.plan)).toEqual(['free', 'premium', 'pro']);
  });

  it('labels promo length, ages and the owner console link', () => {
    expect(promoLength(null)).toBe('Never expires');
    expect(promoLength(30)).toBe('30 days');
    const now = Date.parse('2026-11-23T12:00:00Z');
    expect(ageLabel(null, now)).toBe('never');
    expect(ageLabel('2026-11-23T11:30:00Z', now)).toBe('30m ago');
    expect(ageLabel('2026-11-20T12:00:00Z', now)).toBe('3d ago');
    expect(ownerConsoleUrl('https://api.x.io/')).toBe('https://api.x.io/admin/videos');
  });
});
