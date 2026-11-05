import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { ANALYSIS_FEATURES_UI } from '@/data/analysis-features';
import { FEATURES_IDS } from '@/constants';

export type LockedProFeatureSectionProps = {
    featureId: string;
    title: string;
    description: string;
    ctaLabel?: string;
};

const DEFAULT_DESCRIPTION =
    ANALYSIS_FEATURES_UI.find((f) => f.id === FEATURES_IDS.ADVANCED_ANALYTICS)?.description ??
    'Emotional triggers, retention drivers and your weakest moment';

/**
 * Locked preview for Pro-gated report sections. Always shows the title, a real
 * description, and an upgrade path so every user can see what Advanced analytics is.
 */
export function LockedProFeatureSection({
    featureId,
    title,
    description = DEFAULT_DESCRIPTION,
    ctaLabel = 'Unlock on a paid plan',
}: LockedProFeatureSectionProps) {
    return (
        <div
            className="relative mb-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4"
            data-feature-locked={featureId}
            data-testid="advanced-analytics-locked"
        >
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold uppercase tracking-wide text-white">{title}</span>
                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-zinc-200">
                    <Lock className="h-3 w-3" strokeWidth={2.5} />
                    Pro
                </span>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-zinc-300">{description}</p>
            <Link
                to="/subscription-plans"
                className="inline-flex h-10 min-h-[40px] items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10"
            >
                {ctaLabel}
            </Link>
        </div>
    );
}
