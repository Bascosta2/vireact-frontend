import { Sparkles } from 'lucide-react';
import { ButtonLink } from '@/components/app/Button';
import { useSubscription } from '@/redux/hooks/use-subscription';
import { TRIAL_PATH } from '@/lib/plan-limits';
import { cn } from '@/lib/utils';

/**
 * Advertises the free trial to accounts that can still take it (free plan, never had a trial or a
 * paid plan). Renders nothing for everyone else, so it is safe to place on any signed-in page.
 */
export function TrialBanner({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { trialEligible, trialDays } = useSubscription();
  if (!trialEligible) return null;

  return (
    <aside
      aria-label={`${trialDays}-day free trial`}
      className={cn('app-panel flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-4 sm:px-5', className)}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-tint text-accent" aria-hidden="true">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">Try a paid plan free for {trialDays} days</p>
          {!compact && (
            <p className="mt-0.5 text-sm text-fg-muted">
              More analyses, more coach messages and Advanced Analytics on Pro. $0 today, cancel anytime.
            </p>
          )}
        </div>
      </div>
      <ButtonLink to={TRIAL_PATH} size="sm">
        Start free trial
      </ButtonLink>
    </aside>
  );
}
