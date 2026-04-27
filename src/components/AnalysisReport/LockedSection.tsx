import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export type LockedProFeatureSectionProps = {
    featureId: string;
    title: string;
    description: string;
    ctaLabel?: string;
};

/**
 * Reusable "locked" preview for Pro-gated report sections. Shows a blurred
 * skeleton tease, Pro badge, and upgrade CTA (used e.g. for Advanced Analytics
 * on Free/Premium when the pipeline produced no data).
 */
export function LockedProFeatureSection({
    featureId,
    title,
    description,
    ctaLabel = 'Unlock Advanced Analytics — Upgrade to Pro',
}: LockedProFeatureSectionProps) {
    return (
        <div
            className="relative mb-4 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-4"
            data-feature-locked={featureId}
            style={{
                backgroundImage:
                    'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(249,115,22,0.04) 100%)',
            }}
        >
            <div className="pointer-events-none absolute inset-0 z-0 opacity-50" aria-hidden>
                <div className="m-3 h-3 w-3/4 max-w-sm rounded bg-white/10" />
                <div className="mx-3 mt-3 h-20 rounded-lg border border-white/[0.06] bg-gradient-to-b from-white/[0.08] to-white/[0.02] blur-[1px]" />
                <div className="mx-3 mt-2 h-2 w-1/2 max-w-xs rounded bg-white/10" />
            </div>
            <div className="relative z-10">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                        {title}
                    </span>
                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                        <Lock className="h-3 w-3" strokeWidth={2.5} />
                        Pro
                    </span>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-white/75">{description}</p>
                <Link
                    to="/subscription-plans"
                    className="inline-flex h-10 min-h-[40px] items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-95"
                >
                    {ctaLabel}
                </Link>
            </div>
        </div>
    );
}
