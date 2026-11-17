import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Check, CreditCard, ShieldCheck } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { Button } from '@/components/app/Button';
import { Skeleton } from '@/components/app/Skeleton';
import { createCheckoutSession } from '@/api/subscription';
import { getTier, type CheckoutPlan, type Tier } from '@/config/tiers';
import { useSubscription } from '@/redux/hooks/use-subscription';
import { trialEndLabel, trialHeadline } from '@/lib/plan-limits';
import { cn } from '@/lib/utils';

const TRIAL_PLANS: CheckoutPlan[] = ['premium', 'pro'];

const planPoints = (tier: Tier): string[] => {
  const inc = tier.includes;
  return [
    `Video analyses: ${inc.analyses}`,
    `AI coach chat: ${inc.chat}`,
    `Full scripts per video: ${inc.scripts}`,
    typeof inc.strategy === 'string' ? `2-week AI posting plan: ${inc.strategy}` : null,
    inc.advanced ? 'Advanced Analytics: emotional triggers, retention drivers, weakest moment' : null,
    inc.support ? 'Priority support' : null,
  ].filter((p): p is string => p !== null);
};

/**
 * Free trial offer. Creators land here automatically when they run out of analyses or coach messages,
 * and from the trial banners before that. Accounts that cannot take the trial go to the plans page.
 */
function Trial() {
  const [params] = useSearchParams();
  const { status, plan, trialEligible, trialDays, trialVideoLimit, trialChatMessageLimit, lastFetchedAt, ensureLoaded } = useSubscription();
  const [starting, setStarting] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void ensureLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loaded = lastFetchedAt != null;
  if (!loaded && status !== 'error') {
    return (
      <UserPage>
        <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8" aria-busy="true" aria-label="Loading">
          <Skeleton className="h-10 w-80 max-w-full" />
          <Skeleton className="mt-8 h-72 w-full" />
        </div>
      </UserPage>
    );
  }
  // Already had a trial or a plan (or the plan could not load): the plans page is the right place.
  if (!trialEligible) return <Navigate to="/subscription-plans" replace />;

  const reason = params.get('reason');
  const { title, body } = trialHeadline(reason, trialDays);
  const chargeDate = trialEndLabel(trialDays);

  const start = async (checkoutPlan: CheckoutPlan) => {
    setError(null);
    setStarting(checkoutPlan);
    try {
      const { url } = await createCheckoutSession(checkoutPlan, { trial: true });
      window.location.href = url;
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setStarting(null);
      setError(e?.response?.data?.message || 'We could not start the trial. Please try again.');
    }
  };

  return (
    <UserPage>
      <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8 md:py-12">
        <header className="max-w-2xl">
          <p className="app-label text-accent">{trialDays}-day free trial</p>
          <h1 className="app-title mt-3 break-words">{title}</h1>
          <p className="mt-3 text-base text-fg-muted">{body}</p>
        </header>

        {params.get('cancelled') === 'true' && (
          <p role="status" className="mt-6 rounded-lg border border-line bg-surface p-4 text-sm text-fg">
            Checkout was cancelled. Nothing was charged and your free plan is unchanged.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-6 rounded-lg border border-danger/40 bg-surface p-4 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {TRIAL_PLANS.map((id) => {
            const tier = getTier(id);
            if (!tier) return null;
            const featured = id === 'pro';
            return (
              <section
                key={id}
                aria-label={`${tier.name} plan free trial`}
                className={cn('flex flex-col rounded-2xl border bg-surface p-6', featured ? 'border-accent/60 shadow-[0_0_40px_-16px_rgba(232,103,53,0.6)]' : 'border-line')}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-fg">{tier.name}</h2>
                  {featured && <span className="rounded-full bg-accent-tint px-2.5 py-0.5 text-xs font-semibold text-accent">Most complete</span>}
                </div>
                <p className="mt-1 text-sm text-fg-muted">{tier.tagline}</p>
                <p className="mt-5 flex items-baseline gap-2">
                  <span className="tabular text-4xl font-bold text-fg">$0</span>
                  <span className="text-sm text-fg-muted">for {trialDays} days</span>
                </p>
                <p className="tabular mt-1 text-sm text-fg-muted">
                  Then {tier.priceDisplay} / month from {chargeDate}, unless you cancel.
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {planPoints(tier).map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-fg">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={3} aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Button
                  fullWidth
                  variant={featured ? 'primary' : 'secondary'}
                  className="mt-6"
                  disabled={starting !== null}
                  onClick={() => void start(id)}
                >
                  {starting === id ? 'Opening secure checkout' : `Start ${trialDays}-day free trial`}
                </Button>
              </section>
            );
          })}
        </div>

        <ul className="mt-6 grid gap-3 text-sm text-fg-muted sm:grid-cols-2">
          <li className="flex items-start gap-2.5">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
            <span>
              A card is needed to start. <span className="text-fg">You pay $0 today</span>; the first charge is on {chargeDate}.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
            <span>Cancel anytime in Settings before {chargeDate} and you are never charged. Checkout is handled by Stripe.</span>
          </li>
        </ul>
        {trialVideoLimit != null && trialChatMessageLimit != null && (
          <p className="tabular mt-4 text-sm text-fg-subtle">
            During the trial you get up to {trialVideoLimit} video analyses and {trialChatMessageLimit} coach messages. The full plan
            allowance starts with your first payment. One free trial per account.
          </p>
        )}

        <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to="/subscription-plans" className="app-focus rounded font-medium text-accent hover:underline">
            Compare all plans
          </Link>
          <Link to="/dashboard" className="app-focus rounded text-fg-muted hover:text-fg">
            {plan === 'free' ? 'Stay on the free plan' : 'Back to Home'}
          </Link>
        </p>
      </div>
    </UserPage>
  );
}

export default Trial;
