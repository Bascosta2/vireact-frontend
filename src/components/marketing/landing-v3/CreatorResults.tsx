import { winsData } from '@/components/Home/WinsSection/wins-data';
import { PrimaryCta } from './PrimaryCta';
import { claims } from '@/content/claims';

export function CreatorResults() {
  const creatorCount =
    claims.creatorCountSummary?.verified && claims.creatorCountSummary.value
      ? claims.creatorCountSummary.value
      : null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <header className="mb-8 space-y-3 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Creator results</p>
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          We&apos;ve helped {creatorCount ?? 'short-form'} creators improve their videos.
        </h2>
        <p className="text-sm text-zinc-300">
          These are real creators using Vireact to tighten their hooks, fix pacing, and understand why certain videos
          take off.
        </p>
      </header>

      <div className="mb-6 flex items-center gap-2">
        <div className="flex -space-x-2">
          {winsData.slice(0, 4).map((win) => (
            <img
              key={win.name}
              src={win.avatarSrc}
              alt={win.name}
              className="h-8 w-8 rounded-full border border-zinc-900 object-cover"
              loading="lazy"
            />
          ))}
        </div>
        <p className="text-xs text-zinc-400">
          Featured channels from the Vireact community. Numbers are placeholders until verified in claims.ts.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
        {winsData.map((win) => (
          <article
            key={win.name}
            className="min-w-[260px] flex-1 rounded-2xl border border-white/10 bg-zinc-950/70 p-4 text-sm text-zinc-200 shadow-sm shadow-black/40 md:min-w-0"
          >
            <div className="mb-3 flex items-center gap-3">
              <img
                src={win.avatarSrc}
                alt={win.name}
                className="h-9 w-9 rounded-full border border-zinc-900 object-cover"
                loading="lazy"
              />
              <div>
                <div className="text-sm font-semibold text-white">{win.name}</div>
                <div className="text-xs text-zinc-400">
                  {win.platform} · {win.stat}
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-200">&ldquo;{win.quote}&rdquo;</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex justify-center md:justify-start">
        <PrimaryCta location="results" />
      </div>
    </section>
  );
}

