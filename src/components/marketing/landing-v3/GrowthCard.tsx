import { ArrowRight } from 'lucide-react';
import { AssetSlot } from '@/components/marketing/AssetSlot';
import type { AssetId } from '@/content/assets.manifest';
import type { GrowthComparison } from './hero-data';

const followersLabel = (value: string) => (value ? value : import.meta.env.PROD ? '' : 'VERIFY');

const Side = ({ item, when }: { item: GrowthComparison; when: 'before' | 'after' }) => {
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

/** Before/after follower-growth card; a slide in the hero results carousel. */
export const GrowthCard = ({ item }: { item: GrowthComparison }) => (
  <figure className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left backdrop-blur">
    <div className="flex items-center gap-2">
      <Side item={item} when="before" />
      <ArrowRight className="h-4 w-4 shrink-0 text-pink-300" aria-hidden="true" />
      <Side item={item} when="after" />
    </div>
    {item.name && <figcaption className="mt-2 truncate text-xs font-medium text-zinc-300">{item.name}</figcaption>}
  </figure>
);
