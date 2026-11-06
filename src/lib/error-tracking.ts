/**
 * Frontend error tracking. Off unless VITE_SENTRY_DSN is set at build time; the Sentry SDK is then
 * loaded lazily after the page renders, so it never delays the first paint.
 */
export function initErrorTracking(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn || typeof window === 'undefined') return;
  void import('@sentry/react')
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) || import.meta.env.MODE,
        tracesSampleRate: 0,
      });
    })
    .catch(() => {
      /* monitoring must never break the app */
    });
}
