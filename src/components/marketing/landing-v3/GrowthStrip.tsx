import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AssetSlot } from '@/components/marketing/AssetSlot';
import { claims } from '@/content/claims';
import { assetExists, type AssetId } from '@/content/assets.manifest';

type Comparison = (typeof claims.growthComparisons)[number];

/**
 * Production shows a growth card only when the claim is verified and both screenshots exist.
 * Dev shows every slot so missing assets and claims are obvious.
 */
export const visibleGrowthComparisons = (isProd: boolean = import.meta.env.PROD): Comparison[] =>
  claims.growthComparisons.filter((item) => {
    if (!isProd) return true;
    const ready = item.verified && item.beforeFollowers && item.afterFollowers;
    return Boolean(ready) && assetExists(`growth-${item.slot}-before` as AssetId) && assetExists(`growth-${item.slot}-after` as AssetId);
  });

const followersLabel = (value: string) => (value ? value : import.meta.env.PROD ? '' : 'VERIFY');

const Side = ({ item, when }: { item: Comparison; when: 'before' | 'after' }) => {
  const after = when === 'after';
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="relative">
        <AssetSlot
          id={`growth-${item.slot}-${when}` as AssetId}
          alt={`${item.name || 'Creator'} profile ${when} using Vireact`}
          aspect="1 / 1"
          rounded={false}
          className="!rounded-lg"
        />
        <span
          className={`absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
            after ? 'bg-pink-500 text-white' : 'bg-black/70 text-zinc-200'
          }`}
        >
          {when}
        </span>
      </div>
      <p className="truncate text-xs text-zinc-400">
        <span className={`text-base font-bold tabular-nums ${after ? 'text-white' : 'text-zinc-300'}`}>
          {followersLabel(after ? item.afterFollowers : item.beforeFollowers)}
        </span>{' '}
        followers
      </p>
    </div>
  );
};

const GrowthCard = ({ item }: { item: Comparison }) => (
  <figure className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
    <div className="flex items-center gap-2">
      <Side item={item} when="before" />
      <ArrowRight className="h-4 w-4 shrink-0 text-pink-300" aria-hidden="true" />
      <Side item={item} when="after" />
    </div>
    {item.name && <figcaption className="mt-2 truncate text-xs font-medium text-zinc-300">{item.name}</figcaption>}
  </figure>
);

/** Slim before/after follower-growth strip above the 3 steps. Swipes on phones, sits in one row on desktop. */
export function GrowthStrip() {
  const items = visibleGrowthComparisons();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const first = track.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + 12;
      setActive(Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / step))));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [items.length]);

  if (items.length === 0) return null;

  const goTo = (index: number) => {
    const track = trackRef.current;
    const target = track?.children[index] as HTMLElement | undefined;
    if (!track || !target) return;
    track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Creator growth before and after Vireact" className="mb-12 md:mb-16">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 md:text-left">
        Real creators. Real growth.
      </p>
      <div
        ref={trackRef}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div
            key={item.slot}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}`}
            className="w-[80%] max-w-[340px] shrink-0 snap-center sm:w-[46%] md:w-auto md:max-w-none"
          >
            <GrowthCard item={item} />
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-2 flex justify-center gap-1 md:hidden">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span className={`block h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-pink-400' : 'w-1.5 bg-white/30'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
