import { winsData } from '@/components/Home/WinsSection/wins-data';
import { PrimaryCta } from './PrimaryCta';
import { verifiedCreatorCount } from './hero-data';
import { CreatorGrowthCard } from './CreatorGrowthCard';

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

      <ul
        tabIndex={0}
        aria-label="Creator testimonials"
        className="flex snap-x gap-4 overflow-x-auto pt-1 pb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible"
      >
        {winsData.map((win) => (
          <li key={win.name} className="min-w-[280px] flex-1 snap-start md:min-w-0">
            <CreatorGrowthCard win={win} />
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-center md:justify-start">
        <PrimaryCta location="results" />
      </div>
    </section>
  );
}
