export interface Attribution {
  ref?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_path?: string;
  captured_at?: string;
}

export const ATTRIBUTION_STORAGE_KEY = 'vireact_attr_v1';
const QUERY_KEYS = ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const MAX_FIELD_LENGTH = 200;

const clip = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, MAX_FIELD_LENGTH) : undefined;
};

/** External referrer host only; same-site and empty referrers are dropped. */
const referrerHost = (referrer: string, currentHost: string): string | undefined => {
  if (!referrer) return undefined;
  try {
    const host = new URL(referrer).hostname;
    return host && host !== currentHost ? clip(host) : undefined;
  } catch {
    return undefined;
  }
};

export const parseAttribution = (
  search: string,
  referrer: string,
  pathname: string,
  currentHost: string
): Attribution | null => {
  const params = new URLSearchParams(search);
  const result: Attribution = {};
  for (const key of QUERY_KEYS) {
    const value = clip(params.get(key));
    if (value) result[key] = value;
  }
  const ref = referrerHost(referrer, currentHost);
  if (ref) result.referrer = ref;
  if (Object.keys(result).length === 0) return null;
  result.landing_path = clip(pathname);
  return result;
};

/** First-touch: an existing stored attribution is never overwritten. */
export const captureAttribution = (): void => {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(ATTRIBUTION_STORAGE_KEY)) return;
    const parsed = parseAttribution(
      window.location.search,
      document.referrer,
      window.location.pathname,
      window.location.hostname
    );
    if (!parsed) return;
    parsed.captured_at = new Date().toISOString();
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Storage may be unavailable (private mode); attribution is best-effort.
  }
};

export const getAttribution = (): Attribution | null => {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
};
