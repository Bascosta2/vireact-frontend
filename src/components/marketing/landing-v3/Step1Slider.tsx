import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AssetSlot } from '@/components/marketing/AssetSlot';
import { claims } from '@/content/claims';
import { assetExists, type AssetId } from '@/content/assets.manifest';

type Comparison = (typeof claims.growthComparisons)[number];

type Slide = { kind: 'report' } | { kind: 'growth'; item: Comparison };

/**
 * Production shows a growth slide only when the claim is verified and both screenshots exist.
 * Dev shows every slot so missing assets and claims are obvious.
 */
export const visibleGrowthComparisons = (isProd: boolean = import.meta.env.PROD): Comparison[] =>
  claims.growthComparisons.filter((item) => {
    if (!isProd) return true;
    const ready = item.verified && item.beforeFollowers && item.afterFollowers;
    return Boolean(ready) && assetExists(`growth-${item.slot}-before` as AssetId) && assetExists(`growth-${item.slot}-after` as AssetId);
  });

const ReportSlide = () => (
  <figure className="flex h-full flex-col items-center justify-center gap-3">
    <div className="w-full max-w-[210px] sm:max-w-[240px]">
      <AssetSlot id="phase-1" alt="Vireact analysis report with hook, pacing, audio and caption scores" aspect="4 / 5" />
    </div>
    <figcaption className="text-center text-xs text-zinc-300">Your analysis report: every score, in one place</figcaption>
  </figure>
);

const followersLabel = (value: string) => (value ? value : import.meta.env.PROD ? '' : 'VERIFY');

const GrowthSlide = ({ item }: { item: Comparison }) => (
  <figure className="flex h-full flex-col justify-center gap-3">
    <div className="grid grid-cols-2 gap-2">
      {(['before', 'after'] as const).map((when) => (
        <div key={when} className="space-y-2">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${when === 'after' ? 'text-pink-200' : 'text-zinc-400'}`}>
            {when}
          </p>
          <AssetSlot
            id={`growth-${item.slot}-${when}` as AssetId}
            alt={`${item.name || 'Creator'} profile ${when === 'before' ? 'before' : 'after'} using Vireact`}
            aspect="1 / 1"
            rounded={false}
            className="!rounded-xl"
          />
          <p className="text-sm text-zinc-300">
            <span className={`text-lg font-bold tabular-nums ${when === 'after' ? 'text-white' : 'text-zinc-300'}`}>
              {followersLabel(when === 'before' ? item.beforeFollowers : item.afterFollowers)}
            </span>{' '}
            followers
          </p>
        </div>
      ))}
    </div>
    {item.name && <figcaption className="text-xs text-zinc-300">{item.name}</figcaption>}
  </figure>
);

/** Step 01 visual: analysis report first, then verified before/after growth slides. Native swipe on mobile. */
export function Step1Slider() {
  const slides: Slide[] = [{ kind: 'report' }, ...visibleGrowthComparisons().map((item) => ({ kind: 'growth' as const, item }))];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const first = track.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + 12;
      setActive(Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / step))));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [slides.length]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const target = track?.children[index] as HTMLElement | undefined;
    if (!track || !target) return;
    track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  };

  if (slides.length === 1) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <ReportSlide />
      </div>
    );
  }

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Analysis report and creator growth" className="space-y-3">
      <div
        ref={trackRef}
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.kind === 'report' ? 'report' : `growth-${slide.item.slot}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className="w-[86%] shrink-0 snap-center rounded-2xl border border-white/10 bg-black/30 p-4 sm:w-[78%] md:w-full"
          >
            {slide.kind === 'report' ? <ReportSlide /> : <GrowthSlide item={slide.item} />}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, active - 1))}
          disabled={active === 0}
          aria-label="Previous slide"
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-200 disabled:opacity-30 md:flex"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span className={`block h-2 rounded-full transition-all ${i === active ? 'w-5 bg-pink-400' : 'w-2 bg-white/30'}`} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(Math.min(slides.length - 1, active + 1))}
          disabled={active === slides.length - 1}
          aria-label="Next slide"
          className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-200 disabled:opacity-30 md:flex"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
