import { winsData } from '@/components/Home/WinsSection/wins-data';
import { PrimaryCta } from './PrimaryCta';
import { avatarThumb, verifiedCreatorCount } from './HeroProofRow';

export function CreatorResults() {
  const count = verifiedCreatorCount();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <header className="mb-8 space-y-3 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Creator results</p>
        <h2 className="!text-3xl sm:!text-4xl">
          {count ? `${count} creators use Vireact to fix their videos.` : 'Creators use Vireact to fix their videos.'}
        </h2>
        <p className="text-zinc-300">
          Real channels that fixed their hooks and pacing and figured out why some videos take off.
        </p>
      </header>

      <ul className="flex snap-x gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
        {winsData.map((win) => (
          <li
            key={win.name}
            className="min-w-[260px] flex-1 snap-start rounded-2xl border border-white/10 bg-zinc-950/70 p-4 text-sm text-zinc-200 shadow-sm shadow-black/40 md:min-w-0"
          >
            <div className="mb-3 flex items-center gap-3">
              <img
                src={avatarThumb(win.avatarSrc)}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full border border-zinc-900 object-cover"
                loading="lazy"
                decoding="async"
              />
              <div>
                <p className="text-sm font-semibold text-white">{win.name}</p>
                <p className="text-xs text-zinc-300">
                  {win.platform} · {win.stat}
                </p>
              </div>
            </div>
            <blockquote>&ldquo;{win.quote}&rdquo;</blockquote>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-center md:justify-start">
        <PrimaryCta location="results" />
      </div>
    </section>
  );
}
