/**
 * Plan limits and the free trial offer.
 * When someone hits a limit they are sent to /trial, which offers the 7-day free trial if the account
 * can still take one (the backend decides: `trial.eligible` on /subscription) and otherwise forwards
 * to the plans page.
 */
export type LimitReason = 'videos' | 'chat';

export const TRIAL_PATH = '/trial';

export const limitPath = (reason: LimitReason): string => `${TRIAL_PATH}?reason=${reason}`;

const LIMIT_CODES = new Set(['VIDEO_LIMIT', 'CHAT_LIMIT']);

/** True for the backend's "you are out of analyses / messages" answer (403 with a limit code or message). */
export const isLimitError = (err: unknown): boolean => {
  const e = err as { response?: { status?: number; data?: { message?: string; data?: { code?: string } | null } } };
  if (e?.response?.status !== 403) return false;
  const code = e.response.data?.data?.code;
  if (code && LIMIT_CODES.has(code)) return true;
  return /limit/i.test(e.response.data?.message ?? '');
};

/** "Nov 24" style date for "you won't be charged before …". */
export const trialEndLabel = (days: number, from: Date = new Date()): string =>
  new Date(from.getTime() + days * 86_400_000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** Headline for why the creator landed here (sent from a limit) or a neutral one (came from a banner). */
export const trialHeadline = (reason: string | null, days: number): { title: string; body: string } => {
  if (reason === 'videos') {
    return {
      title: "You've used all your free analyses",
      body: `Keep going with a ${days}-day free trial. Pick a plan, add a card and analyze your next video right away.`,
    };
  }
  if (reason === 'chat') {
    return {
      title: "You've used this month's free coach messages",
      body: `Keep the conversation going with a ${days}-day free trial. Pick a plan and add a card to continue.`,
    };
  }
  return {
    title: `Try Vireact free for ${days} days`,
    body: 'Pick a plan and add a card. You pay nothing today and can cancel anytime during the trial.',
  };
};

export interface PlanLock {
  feature: string;
  detail: string;
  /** Plans that include it. */
  on: string;
}

/** What this plan does not get on the report. Empty for plans that have everything (Pro, Enterprise). */
export const planLocks = (plan: string | null): PlanLock[] => {
  const advanced: PlanLock = {
    feature: 'Advanced Analytics',
    detail: 'Emotional triggers, retention drivers and your weakest moment',
    on: 'Pro',
  };
  if (plan === 'free') {
    return [
      advanced,
      { feature: '8 of the 10 full scripts', detail: 'You can read 2 scripts per video; the other idea names are shown locked', on: 'Premium (6) and Pro (10)' },
      { feature: '2-week AI posting plan', detail: 'A posting schedule built from your results', on: 'Premium and Pro' },
    ];
  }
  if (plan === 'premium') {
    return [advanced, { feature: '4 of the 10 full scripts', detail: 'You can read 6 scripts per video', on: 'Pro' }];
  }
  return [];
};

/** Full scripts each plan can open per video (backend SCRIPT_ACCESS mirrors this). Each video has 10 ideas. */
export const SCRIPT_IDEAS_PER_VIDEO = 10;
const SCRIPT_ACCESS: Record<string, number> = { free: 2, premium: 6, pro: 10, enterprise: 10 };
export const scriptAccessForPlan = (plan: string | null | undefined): number => SCRIPT_ACCESS[plan ?? ''] ?? SCRIPT_ACCESS.free;
