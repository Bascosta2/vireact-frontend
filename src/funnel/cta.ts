export const isFunnelV2Enabled = (): boolean =>
  String(import.meta.env.VITE_FUNNEL_V2 ?? '').toLowerCase() === 'true';

/** Where logged-out primary CTAs send people: the quiz when Funnel V2 is on, signup otherwise. */
export const primaryCtaPath = (): string => (isFunnelV2Enabled() ? '/start' : '/signup');
