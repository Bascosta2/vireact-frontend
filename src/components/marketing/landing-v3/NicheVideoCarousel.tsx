import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import CustomMarquee from '@/components/UI/Marquee';
import { nicheData } from '@/components/FeaturesPage/Niches/niche-data';
import { useMobileHorizontalAutoScroll } from '@/hooks/useMobileHorizontalAutoScroll';
import { prefersReducedMotion } from '@/lib/motion';
import { Highlight } from './Highlight';

type Niche = (typeof nicheData)[number];

/** Category pill only: the old founder label carried an unverified follower count. */
const VideoCard = ({ niche, className }: { niche: Niche; className: string }) => (
  <div className={`relative shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-lg shadow-black/40 ${className}`}>
    <img src={niche.thumbnail} alt={niche.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    <span className="absolute top-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
      {niche.category}
    </span>
  </div>
);

/** "From idea to viral" niche thumbnails: marquee on desktop, swipeable auto-scroll row on phones. */
export function NicheVideoCarousel() {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [paused, setPaused] = useState(false);
  const stopped = paused || reducedMotion;
  const mobileScroll = useMobileHorizontalAutoScroll(stopped);

  return (
    <section className="w-full overflow-hidden py-14 md:py-20" aria-labelledby="niche-carousel-title">
      <header className="mx-auto mb-8 flex max-w-6xl flex-col items-center gap-3 px-4 text-center md:mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Every niche</p>
        <h2 id="niche-carousel-title" className="!text-3xl sm:!text-4xl md:!text-5xl">
          From idea to viral, <Highlight>instant predictions made easy</Highlight>
        </h2>
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Play video carousel' : 'Pause video carousel'}
            className="mt-1 flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs text-zinc-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400"
          >
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            {paused ? 'Play' : 'Pause'}
          </button>
        )}
      </header>

      <div
        ref={mobileScroll.scrollRef}
        {...mobileScroll.touchHandlers}
        tabIndex={0}
        aria-label="Example videos by niche"
        className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400 md:hidden [&::-webkit-scrollbar]:hidden"
      >
        {nicheData.map((niche) => (
          <VideoCard key={niche.id} niche={niche} className="aspect-[9/16] w-[150px]" />
        ))}
      </div>

      <div className="hidden md:block">
        <CustomMarquee speed={35} direction="right" pauseOnHover play={!stopped}>
          {nicheData.map((niche) => (
            <VideoCard key={niche.id} niche={niche} className="mx-2.5 h-[400px] w-[225px]" />
          ))}
        </CustomMarquee>
      </div>
    </section>
  );
}
