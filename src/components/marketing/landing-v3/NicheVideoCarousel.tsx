import { useState } from 'react';
import CustomMarquee from '@/components/UI/Marquee';
import { nicheData } from '@/components/FeaturesPage/Niches/niche-data';
import { prefersReducedMotion } from '@/lib/motion';
import { Highlight } from './Highlight';

type Niche = (typeof nicheData)[number];

const CARD_SIZE = 'aspect-[9/16] w-[150px] md:aspect-auto md:h-[400px] md:w-[225px]';

/** Category pill only: the old founder label carried an unverified follower count. */
const VideoCard = ({ niche, className }: { niche: Niche; className: string }) => (
  <div className={`relative shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-lg shadow-black/40 ${className}`}>
    <img src={niche.thumbnail} alt={niche.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    <span className="absolute top-2.5 left-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
      {niche.category}
    </span>
  </div>
);

/**
 * "From idea to viral" niche thumbnails. Owner decision: the marquee never pauses on hover, tap or click so it
 * reads as part of the page. Only the OS reduced-motion setting stops it (a still, swipeable row instead).
 */
export function NicheVideoCarousel() {
  const [reducedMotion] = useState(prefersReducedMotion);

  return (
    <section className="w-full overflow-hidden py-14 md:py-20" aria-labelledby="niche-carousel-title">
      <header className="mx-auto mb-8 flex max-w-6xl flex-col items-center gap-3 px-4 text-center md:mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Every niche</p>
        <h2 id="niche-carousel-title" className="!text-3xl sm:!text-4xl md:!text-5xl">
          From idea to viral, <Highlight>instant predictions made easy</Highlight>
        </h2>
      </header>

      {reducedMotion ? (
        <div
          tabIndex={0}
          aria-label="Example videos by niche"
          className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400 md:gap-5 [&::-webkit-scrollbar]:hidden"
        >
          {nicheData.map((niche) => (
            <VideoCard key={niche.id} niche={niche} className={CARD_SIZE} />
          ))}
        </div>
      ) : (
        <CustomMarquee speed={35} direction="right">
          {nicheData.map((niche) => (
            <VideoCard key={niche.id} niche={niche} className={`mx-1.5 md:mx-2.5 ${CARD_SIZE}`} />
          ))}
        </CustomMarquee>
      )}
    </section>
  );
}
