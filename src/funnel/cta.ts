export const isFunnelV2Enabled = (): boolean =>
  String(import.meta.env.VITE_FUNNEL_V2 ?? '').toLowerCase() === 'true';

/** Where logged-out primary CTAs send people: the quiz when Funnel V2 is on, signup otherwise. */
export const primaryCtaPath = (): string => (isFunnelV2Enabled() ? '/start' : '/signup');

/** Builds the primary CTA href, preserving `ref` and `utm_*` params from the current URL. */
export const primaryCtaHref = (currentUrl?: string): string => {
  const base = primaryCtaPath();

  // During SSR or tests, we may not have window; fall back to the bare path.
  const href = currentUrl ?? (typeof window !== 'undefined' ? window.location.href : '');
  if (!href) return base;

  let preserved = '';
  try {
    const url = new URL(href);
    const out = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key === 'ref' || key.startsWith('utm_')) {
        out.append(key, value);
      }
    });
    preserved = out.toString();
  } catch {
    preserved = '';
  }

  if (!preserved) return base;
  return `${base}?${preserved}`;
};

