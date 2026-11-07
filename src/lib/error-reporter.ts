/**
 * Safety net, browser side: sends crashes, unhandled errors and failed network calls to the backend
 * (POST /api/v1/client-errors), where they are grouped and the owner is alerted about new kinds.
 *
 * Works without Sentry. Never throws, never retries, and is capped per page load so a broken page
 * cannot flood the server. Known browser noise (extensions, ResizeObserver, cancelled requests) is ignored.
 */
import { VITE_BACKEND_URL } from '@/constants';

const MAX_REPORTS_PER_PAGE = 15;
const sent = new Set<string>();
let count = 0;

const IGNORED: RegExp[] = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i, // cross-origin script with no details
  /chrome-extension:|moz-extension:|safari-extension:/i,
  /AbortError|canceled|cancelled/i,
  /Non-Error promise rejection captured/i,
  // Handled elsewhere: the route boundary reloads once to fetch the new build.
  /Loading chunk \d+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i,
];

export type ClientErrorKind = 'crash' | 'unhandled' | 'rejection' | 'network' | 'api';

export const shouldReport = (message: string, stack = ''): boolean =>
  Boolean(message) && !IGNORED.some((re) => re.test(message) || re.test(stack));

const endpoint = (): string => {
  const base = import.meta.env.DEV ? '' : VITE_BACKEND_URL || '';
  return `${base}/api/v1/client-errors`;
};

const accessToken = (): string | null => {
  try {
    return localStorage.getItem('accessToken');
  } catch {
    return null;
  }
};

/** Report one error. Safe to call from anywhere. */
export function reportClientError(error: unknown, kind: ClientErrorKind = 'unhandled', extra: { route?: string } = {}): void {
  try {
    if (typeof window === 'undefined' || count >= MAX_REPORTS_PER_PAGE) return;
    // A user whose device is offline is not a site problem.
    if (kind === 'network' && typeof navigator !== 'undefined' && navigator.onLine === false) return;
    const err = error as { message?: string; stack?: string } | null;
    const message = String(err?.message ?? error ?? '').slice(0, 500);
    const stack = String(err?.stack ?? '').slice(0, 4000);
    if (!shouldReport(message, stack)) return;
    const key = `${kind}|${message}`;
    if (sent.has(key)) return;
    sent.add(key);
    count++;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = accessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    void fetch(endpoint(), {
      method: 'POST',
      headers,
      keepalive: true,
      body: JSON.stringify({
        message,
        stack,
        kind,
        url: window.location.href.slice(0, 300),
        route: extra.route ?? window.location.pathname,
        release: (import.meta.env.VITE_RELEASE as string | undefined) ?? '',
      }),
    }).catch(() => {});
  } catch {
    /* the safety net must never break the page */
  }
}

let installed = false;

/** Catch errors nothing else handled. Call once at startup. */
export function installGlobalErrorReporting(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (event) => {
    // Resource load errors (img/script) have no `error`; only report real script errors.
    if (event.error || event.message) reportClientError(event.error ?? event.message, 'unhandled');
  });
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as { isAxiosError?: boolean } | undefined;
    // Failed API calls are reported by the API client with better detail.
    if (reason?.isAxiosError) return;
    reportClientError(event.reason, 'rejection');
  });
}

/** Test helper. */
export function resetErrorReporterForTests(): void {
  sent.clear();
  count = 0;
}
