import { ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { avatarThumb, creatorGrowth, type Win } from './hero-data';

interface CreatorGrowthCardProps {
  win: Win;
  /** Clamp the quote to two lines (hero carousel). */
  compact?: boolean;
}

const statLabel = 'font-mono text-[11px] font-semibold uppercase tracking-[0.2em]';

/** Creator result: before -> now subscribers, growth multiple, one highlight and the creator's own quote. */
export function CreatorGrowthCard({ win, compact = false }: CreatorGrowthCardProps) {
  const growth = creatorGrowth(win);

  return (
    <figure className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-4 text-left shadow-lg shadow-black/40 backdrop-blur">
      <div className="pointer-events-none absolute -top-20 -right-16 h-40 w-40 rounded-full bg-pink-500/15 blur-3xl" aria-hidden="true" />

      <div className="relative flex items-center gap-3">
        <img
          src={avatarThumb(win.avatarSrc)}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          decoding="async"
          className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{win.name}</p>
          <p className="truncate text-xs text-zinc-400">{win.platform}</p>
        </div>
        {growth?.multiple && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-2.5 py-1 text-xs font-extrabold tabular-nums text-white shadow-[0_0_18px_rgba(236,72,153,0.45)]">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">Grew </span>
            {growth.multiple}
          </span>
        )}
      </div>

      {growth ? (
        <div className="relative mt-4 flex items-end gap-2" data-testid="creator-growth">
          <p className="flex flex-col">
            <span className={`${statLabel} text-zinc-400`}>Before</span>
            <span className="text-xl font-bold tabular-nums text-zinc-400">{growth.before}</span>
          </p>
          <div className="mb-3 flex min-w-6 flex-1 items-center" aria-hidden="true">
            <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-gradient-to-r from-zinc-600 via-pink-500 to-orange-400">
              <div className="absolute inset-y-0 left-0 w-1/3 animate-[v3-beam_2.4s_linear_infinite] bg-gradient-to-r from-transparent via-white/90 to-transparent motion-reduce:hidden" />
            </div>
            <ChevronRight className="-ml-2 h-5 w-5 shrink-0 text-orange-300" strokeWidth={2.5} />
          </div>
          <p className="flex flex-col">
            <span className={`${statLabel} text-pink-200`}>Now</span>
            <span className="whitespace-nowrap">
              <span className="text-3xl font-extrabold tabular-nums text-[#ff6f61]">
                {growth.now}
              </span>
              {growth.unit && <span className="text-xs font-medium text-zinc-400">{` ${growth.unit}`}</span>}
            </span>
          </p>
        </div>
      ) : (
        <p className="relative mt-4 text-2xl font-extrabold tabular-nums text-[#ff6f61]">
          {win.stat}
        </p>
      )}

      {growth?.highlight && (
        <p className="relative mt-3 flex w-fit items-center gap-1.5 rounded-lg border border-orange-300/20 bg-orange-400/10 px-2.5 py-1 text-xs font-semibold text-orange-100">
          <Zap className="h-3.5 w-3.5 shrink-0 text-orange-300" aria-hidden="true" />
          {growth.highlight}
        </p>
      )}

      <blockquote className={`relative mt-3 text-sm leading-snug text-zinc-300 ${compact ? 'line-clamp-2' : ''}`}>
        &ldquo;{win.quote}&rdquo;
      </blockquote>
    </figure>
  );
}
