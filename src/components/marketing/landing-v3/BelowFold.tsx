import { EasiestWayCards } from './EasiestWayCards';
import { FounderCredibility } from './FoundationCredibility';
import { NicheVideoCarousel } from './NicheVideoCarousel';
import { LibraryTeaser } from './LibraryTeaser';
import { FaqV3 } from './FaqV3';
import { FinalCta } from './FinalCta';
import { TrackedSection } from './TrackedSection';
import { RevealSection } from '@/components/marketing/RevealSection';

/**
 * Everything under the hero; loaded as a separate chunk so first paint only needs the hero.
 * Each section's headings and cards rise in as they scroll into view (RevealSection).
 */
export default function BelowFold() {
  return (
    <>
      <TrackedSection section="how_it_works" id="how-it-works-v3">
        <RevealSection items="header" cards="ol > li">
          <EasiestWayCards />
        </RevealSection>
      </TrackedSection>
      <TrackedSection section="founder_credibility">
        <RevealSection items="h2, ol > li" cards="ul > li">
          <FounderCredibility />
        </RevealSection>
      </TrackedSection>
      <TrackedSection section="niche_carousel">
        {/* Only the heading: the video strip is a moving marquee. */}
        <RevealSection items="header">
          <NicheVideoCarousel />
        </RevealSection>
      </TrackedSection>
      <TrackedSection section="library_teaser">
        <RevealSection items="header" cards="ul > li">
          <LibraryTeaser />
        </RevealSection>
      </TrackedSection>
      <TrackedSection section="faq">
        <RevealSection items="h2, h2 + div">
          <FaqV3 />
        </RevealSection>
      </TrackedSection>
      <TrackedSection section="final_cta">
        <RevealSection items="h2, section > p, section > div">
          <FinalCta />
        </RevealSection>
      </TrackedSection>
    </>
  );
}
