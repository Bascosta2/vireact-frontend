import type { PostHog } from 'posthog-js';
import { getAttribution } from '@/funnel/attribution';

export type AnalyticsEvent =
  | 'landing_viewed'
  | 'cta_clicked'
  | 'section_viewed'
  | 'faq_opened'
  | 'signup_started'
  | 'signup_completed'
  | 'login_completed'
  | 'pricing_viewed'
  | 'checkout_started'
  | 'quiz_started'
  | 'quiz_step_answered'
  | 'quiz_completed'
  | 'results_viewed'
  | 'hook_copied'
  | 'hook_rewrite_used'
  | 'results_email_captured'
  | 'book_call_clicked'
  | 'analytics_viewed'
  | 'strategy_upgrade_clicked';

const MAX_QUEUED_CALLS = 100;

let client: PostHog | null = null;
let loading: Promise<PostHog | null> | null = null;
const queue: Array<(posthog: PostHog) => void> = [];

const posthogKey = (): string | undefined =>
  (import.meta.env.VITE_POSTHOG_KEY as string | undefined) || undefined;

/** Runs now if PostHog is loaded, queues while it loads, and drops calls when analytics is off. */
const withClient = (fn: (posthog: PostHog) => void): void => {
  if (client) {
    fn(client);
    return;
  }
  if (loading && queue.length < MAX_QUEUED_CALLS) queue.push(fn);
};

/** Lazy-loads posthog-js only when VITE_POSTHOG_KEY is set; otherwise every call is a no-op. */
export const initAnalytics = (): void => {
  const key = posthogKey();
  if (loading || typeof window === 'undefined' || !key) return;
  // Calls made before the library loads are queued (see withClient), so loading can wait until after
  // the page's own load event without losing events; this keeps the 100KB+ SDK off the first-paint path.
  loading = afterPageLoad()
    .then(() => import('posthog-js'))
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        autocapture: false,
        capture_pageview: false,
        disable_session_recording: true,
      });
      client = posthog;
      queue.splice(0).forEach((fn) => fn(posthog));
      return posthog;
    })
    .catch(() => {
      queue.length = 0;
      return null;
    });
};

/** Resolves shortly after window `load`, preferring an idle moment. */
const afterPageLoad = (): Promise<void> =>
  new Promise((resolve) => {
    const idle = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(() => resolve(), { timeout: 3000 });
      else setTimeout(resolve, 1000);
    };
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
  });

/** Pass `beforeUnload: true` when a full page navigation follows immediately. */
export const track = (
  event: AnalyticsEvent,
  properties: Record<string, unknown> = {},
  options: { beforeUnload?: boolean } = {}
): void => {
  withClient((posthog) =>
    posthog.capture(
      event,
      properties,
      options.beforeUnload ? { transport: 'sendBeacon', send_instantly: true } : undefined
    )
  );
};

/** Pageview for the current route; called on every route change. */
export const page = (path: string = typeof window === 'undefined' ? '' : window.location.pathname): void => {
  withClient((posthog) => posthog.capture('$pageview', { path }));
};

/** Identify by internal user id only; never pass email or name. */
export const identify = (userId: string | null | undefined): void => {
  if (!userId) return;
  withClient((posthog) => {
    if (posthog.get_distinct_id() === userId) return;
    const attribution = getAttribution();
    posthog.identify(userId, undefined, attribution ? { initial_attribution: attribution } : undefined);
  });
};

/** Links an earlier anonymous id (e.g. a funnel session id) to the current distinct id. */
export const alias = (aliasId: string | null | undefined): void => {
  if (!aliasId) return;
  withClient((posthog) => posthog.alias(aliasId));
};

export const resetAnalytics = (): void => {
  withClient((posthog) => posthog.reset());
};
