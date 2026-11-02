import { HowItWorksPhases } from './HowItWorksPhases';
import { FounderCredibility } from './FoundationCredibility';
import { CreatorResults } from './CreatorResults';
import { LibraryTeaser } from './LibraryTeaser';
import { FaqV3 } from './FaqV3';
import { FinalCta } from './FinalCta';
import { TrackedSection } from './TrackedSection';

/** Everything under the hero; loaded as a separate chunk so first paint only needs the hero. */
export default function BelowFold() {
  return (
    <>
      <TrackedSection section="how_it_works" id="how-it-works-v3">
        <HowItWorksPhases />
      </TrackedSection>
      <TrackedSection section="founder_credibility">
        <FounderCredibility />
      </TrackedSection>
      <TrackedSection section="creator_results">
        <CreatorResults />
      </TrackedSection>
      <TrackedSection section="library_teaser">
        <LibraryTeaser />
      </TrackedSection>
      <TrackedSection section="faq">
        <FaqV3 />
      </TrackedSection>
      <TrackedSection section="final_cta">
        <FinalCta />
      </TrackedSection>
    </>
  );
}
