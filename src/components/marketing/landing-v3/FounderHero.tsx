import { claims } from '@/content/claims';
import { Highlight } from './Highlight';
import { PrimaryCta } from './PrimaryCta';
import { HeroProofRow } from './HeroProofRow';
import { AssetSlot } from '@/components/marketing/AssetSlot';

export interface FounderHeroProps {
  onSeeHowItWorksClick?: () => void;
}

/** Subline needs every founder fact; a partial sentence would read as an invented claim. */
const founderSubline = () => {
  const { founderName, founderAccountCount, founderTotalFollowers, founderTotalViews } = claims;
  if (!founderName || founderAccountCount === null || !founderTotalFollowers || !founderTotalViews) return null;
  return { founderName, founderAccountCount, founderTotalFollowers, founderTotalViews };
};

export function FounderHero({ onSeeHowItWorksClick }: FounderHeroProps) {
  const subline = founderSubline();
  const accounts = claims.founderAccounts.filter((a) => a.handle && a.followers && a.pfpSlot);

  return (
    <section
      id="hero-v3"
      className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 pt-8 pb-12 md:flex-row md:gap-10 md:pt-16 md:pb-20"
    >
      {/* Image first on mobile, right column on desktop */}
      <div className="w-full md:order-2 md:w-1/2">
        <div className="mx-auto max-h-[320px] max-w-sm overflow-hidden rounded-2xl md:max-h-none">
          <AssetSlot id="hero-founder" alt="The founder of Vireact" aspect="4 / 5" priority />
        </div>
      </div>

      <div className="w-full space-y-6 md:order-1 md:w-1/2">
        <div className="inline-flex items-center rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-200">
          Free AI video analysis for short-form creators
        </div>
        <h1 className="!text-4xl font-extrabold tracking-tight text-white sm:!text-5xl md:!text-6xl">
          Find the exact second viewers swipe — and the exact line to <Highlight>replace it with.</Highlight>
        </h1>
        {subline && (
          <p className="max-w-xl text-base text-zinc-300">
            Built by <span className="font-semibold text-white">{subline.founderName}</span>, who grew{' '}
            <span className="font-semibold text-white">{subline.founderAccountCount}</span> accounts to{' '}
            <span className="font-semibold text-white">{subline.founderTotalFollowers}</span> followers and{' '}
            <span className="font-semibold text-white">{subline.founderTotalViews}</span> views.
          </p>
        )}

        {accounts.length > 0 && (
          <ul className="flex flex-wrap gap-2 pt-1">
            {accounts.slice(0, 4).map((acc) => (
              <li
                key={acc.handle}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 py-1 pr-3 pl-1 text-xs text-zinc-200"
              >
                <span className="h-6 w-6 overflow-hidden rounded-full bg-zinc-800">
                  <AssetSlot id={acc.pfpSlot} alt="" aspect="1 / 1" rounded={false} className="!rounded-full" />
                </span>
                <span className="font-medium">{acc.handle}</span>
                <span className="tabular-nums text-zinc-300">{acc.followers}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row sm:items-center">
          <PrimaryCta location="hero" />
          <button
            type="button"
            onClick={onSeeHowItWorksClick}
            className="rounded px-1 text-sm font-medium text-zinc-300 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400"
          >
            See how it works ↓
          </button>
        </div>

        <HeroProofRow />
      </div>
    </section>
  );
}
