import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatResetDate, useQuota } from '@/hooks/useQuota';

export function UsageMeter({ compact = false, className }: { compact?: boolean; className?: string }) {
  const q = useQuota();
  if (!q.loaded) return null;
  const reset = formatResetDate(q.resetsOn);

  if (q.limit == null) {
    return (
      <div className={cn('rounded-xl border border-line bg-surface p-3', className)}>
        <p className="tabular text-sm text-fg">{q.used} analyses this month</p>
        <p className="mt-0.5 text-xs text-fg-muted">Unlimited plan</p>
      </div>
    );
  }

  const pct = q.limit > 0 ? Math.min(100, (q.used / q.limit) * 100) : 100;
  const atLimit = q.used >= q.limit;
  const showUpgrade = q.plan !== 'enterprise' && (q.plan !== 'pro' || atLimit);

  return (
    <div className={cn('rounded-xl border border-line bg-surface p-3', className)}>
      <p className="tabular text-sm text-fg">
        {q.used} of {q.limit} analyses this month
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label="Analyses used this month"
        aria-valuemin={0}
        aria-valuemax={q.limit}
        aria-valuenow={q.used}
      >
        <div
          className={cn('h-full origin-left rounded-full', atLimit ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-accent')}
          style={{ transform: `scaleX(${Math.max(pct, 2) / 100})` }}
        />
      </div>
      <div className={cn('mt-2 flex items-center justify-between gap-2 text-xs', compact && 'flex-col items-start')}>
        {reset && <span className="text-fg-muted">Resets {reset}</span>}
        {showUpgrade && (
          <Link to="/subscription-plans" className="app-focus rounded font-medium text-accent hover:underline">
            Upgrade
          </Link>
        )}
      </div>
    </div>
  );
}
