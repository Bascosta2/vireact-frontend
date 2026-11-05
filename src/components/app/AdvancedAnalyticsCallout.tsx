import { BarChart2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ANALYSIS_FEATURES_UI } from '@/data/analysis-features';
import { FEATURES_IDS } from '@/constants';

const FEATURE = ANALYSIS_FEATURES_UI.find((f) => f.id === FEATURES_IDS.ADVANCED_ANALYTICS);

/** Always-visible Advanced analytics card. Locked for free/premium; included for paying plans. */
export function AdvancedAnalyticsCallout({ unlocked }: { unlocked: boolean }) {
  if (!FEATURE) return null;

  return (
    <aside
      data-testid="advanced-analytics-callout"
      className="app-glass mt-4 rounded-xl p-4"
      aria-label={unlocked ? 'Advanced analytics is included' : 'Advanced analytics is a paid check'}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-fg-muted">
          {unlocked ? <BarChart2 className="h-5 w-5" aria-hidden="true" /> : <Lock className="h-5 w-5" aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
            {FEATURE.label}
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-medium text-fg-muted">
              {unlocked ? 'Included' : 'Pro'}
            </span>
          </p>
          <p className="mt-1 text-sm text-fg-muted">{FEATURE.description}</p>
          {!unlocked && (
            <Link
              to="/subscription-plans"
              className="app-focus mt-3 inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-accent hover:underline"
            >
              Unlock on a paid plan
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
