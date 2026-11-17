import { Lock } from 'lucide-react';
import { ButtonLink } from '@/components/app/Button';
import { useSubscription } from '@/redux/hooks/use-subscription';
import { TRIAL_PATH, planLocks } from '@/lib/plan-limits';

/**
 * Report banner that says plainly which parts are locked on the creator's plan and how much of the
 * plan's allowance is left. It is a labelled region, so screen readers announce it with the report.
 */
export function PlanLocksNotice() {
  const {
    plan, trialEligible, trialDays, lastFetchedAt,
    chatMessagesUsedThisPeriod, chatMessagesPerMonthLimit, lifetimeFreeVideosUsed, lifetimeFreeVideoLimit,
  } = useSubscription();
  if (lastFetchedAt == null) return null;
  const locks = planLocks(plan);
  if (locks.length === 0) return null;

  const planName = plan === 'premium' ? 'Premium' : 'Free';
  const usage: string[] = [];
  if (plan === 'free' && lifetimeFreeVideoLimit != null) {
    usage.push(`${Math.min(lifetimeFreeVideosUsed ?? 0, lifetimeFreeVideoLimit)} of ${lifetimeFreeVideoLimit} free video analyses used (they do not renew)`);
  }
  if (plan === 'free' && chatMessagesPerMonthLimit != null) {
    const left = Math.max(0, chatMessagesPerMonthLimit - (chatMessagesUsedThisPeriod ?? 0));
    usage.push(`${left} of ${chatMessagesPerMonthLimit} coach messages left this month`);
  }

  return (
    <section
      aria-label={`Locked on the ${planName} plan`}
      data-testid="plan-locks-notice"
      className="mb-6 rounded-xl border border-warning/30 bg-warning/[0.06] p-4"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning" aria-hidden="true">
          <Lock className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-fg">
            You are on the {planName} plan. Some features are locked.
          </h2>
          <ul className="mt-2 space-y-1.5">
            {locks.map((l) => (
              <li key={l.feature} className="text-sm text-fg-muted">
                <span className="font-medium text-fg">{l.feature}</span>: {l.detail}.{' '}
                <span className="whitespace-nowrap rounded-full border border-warning/30 px-2 py-0.5 text-[11px] font-semibold text-warning">
                  Locked · {l.on}
                </span>
              </li>
            ))}
          </ul>
          {usage.length > 0 && <p className="tabular mt-3 text-sm text-fg-muted">{usage.join(' · ')}.</p>}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {trialEligible ? (
              <ButtonLink to={TRIAL_PATH} size="sm">
                Unlock with a {trialDays}-day free trial
              </ButtonLink>
            ) : (
              <ButtonLink to="/subscription-plans" size="sm">
                {plan === 'premium' ? 'Switch to Pro' : 'See plans'}
              </ButtonLink>
            )}
            {trialEligible && <span className="text-xs text-fg-subtle">$0 today, cancel anytime</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
