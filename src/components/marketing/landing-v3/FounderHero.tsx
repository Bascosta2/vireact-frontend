import { useMemo } from 'react';
import { claims } from '@/content/claims';
import { Highlight } from './Highlight';
import { PRIMARY_CTA_LABEL, PrimaryCta } from './PrimaryCta';
import { AssetSlot } from '@/components/marketing/AssetSlot';
import { track } from '@/lib/analytics';

export interface FounderHeroProps {
  onSeeHowItWorksClick?: () => void;
}

export function FounderHero({ onSeeHowItWorksClick }: FounderHeroProps) {
  const founderEnabled = !!claims.founderName;

  const creatorCountLabel = useMemo(() => {
    if (claims.creatorCountSummary?.verified && claims.creatorCountSummary.value) {
      return claims.creatorCountSummary.value;
    }
    return claims.creatorCount ? claims.creatorCount.toString() : null;
  }, []);

  const ratingLabel = useMemo(() => {
    if (!claims.ratingSummary?.verified) return null;
    return `${claims.ratingSummary.value} · ${claims.ratingSummary.count}`;
  }, []);

  const accounts = Array.isArray(claims.founderAccounts) ? claims.founderAccounts : [];

  const handleSeeHowItWorks = () => {
    track('section_viewed', { section: 'how_it_works_scroll' });
    onSeeHowItWorksClick?.();
  };

  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pt-16 pb-12 md:flex-row md:pt-24 md:pb-20">
      {/* Visual column (mobile first) */}
      <div className="w-full md:w-1/2 md:order-2">
        <div className="mx-auto max-w-sm">
          <AssetSlot id="hero-founder" alt="Vireact founder" aspect="4 / 5" priority rounded />
        </div>
      </div>

      {/* Copy column */}
      <div className="w-full space-y-6 md:w-1/2 md:order-1">
        <div className="inline-flex items-center rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-200">
          Free AI video analysis for short-form creators
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Find the exact second viewers swipe — and the exact line to{' '}
          <Highlight>replace it with.</Highlight>
        </h1>
        {founderEnabled && (
          <p className="max-w-xl text-base text-zinc-300">
            Built by <span className="font-semibold text-white">{claims.founderName}</span>, who grew{' '}
            <span className="font-semibold text-white">{claims.founderAccountCount ?? '—'}</span> accounts to{' '}
            <span className="font-semibold text-white">{claims.founderTotalFollowers || '—'}</span> followers and{' '}
            <span className="font-semibold text-white">{claims.founderTotalViews || '—'}</span> views.
          </p>
        )}

        {/* Stat chips */}
        {accounts.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {accounts.map((acc) => (
              <div
                key={acc.handle}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-200"
              >
                <span className="h-6 w-6 overflow-hidden rounded-full bg-zinc-800">
                  <AssetSlot id={acc.pfpSlot} alt={acc.handle} aspect="1 / 1" rounded />
                </span>
                <span className="font-medium">{acc.handle}</span>
                <span className="text-zinc-400">{acc.followers}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA row */}
        <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row sm:items-center">
          <PrimaryCta location="hero" />
          <button
            type="button"
            onClick={handleSeeHowItWorks}
            className="text-sm font-medium text-zinc-300 underline-offset-4 hover:text-white hover:underline"
          >
            See how it works ↓
          </button>
        </div>

        {/* Proof row */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          {/* Placeholder avatar strip; avatars will be driven by testimonials data later. */}
          <div className="flex -space-x-2">
            <div className="h-7 w-7 rounded-full border border-zinc-900 bg-zinc-700/80" />
            <div className="h-7 w-7 rounded-full border border-zinc-900 bg-zinc-700/80" />
            <div className="h-7 w-7 rounded-full border border-zinc-900 bg-zinc-700/80" />
          </div>
          <div className="text-xs text-zinc-400">
            Used by {creatorCountLabel ?? 'creators'} {ratingLabel && <span>· {ratingLabel}</span>}
          </div>
        </div>

        <p className="pt-2 text-xs text-zinc-500">
          {PRIMARY_CTA_LABEL}. No credit card required for the free analysis.
        </p>
      </div>
    </section>
  );
}

