import { useEffect, useRef, useState } from 'react';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import { track } from '@/lib/analytics';
import { StickyCtaBar } from '@/components/marketing/landing-v3/StickyCtaBar';
import { FounderHero } from '@/components/marketing/landing-v3/FounderHero';
import { ResultsBand } from '@/components/marketing/landing-v3/ResultsBand';
import { FreeStack } from '@/components/marketing/landing-v3/FreeStack';
import { HowItWorksPhases } from '@/components/marketing/landing-v3/HowItWorksPhases';
import { FounderCredibility } from '@/components/marketing/landing-v3/FoundationCredibility';
import { CreatorResults } from '@/components/marketing/landing-v3/CreatorResults';
import { LibraryTeaser } from '@/components/marketing/landing-v3/LibraryTeaser';
import { FaqV3 } from '@/components/marketing/landing-v3/FaqV3';
import { FinalCta } from '@/components/marketing/landing-v3/FinalCta';

export const isLandingV3Enabled = (): boolean =>
  String(import.meta.env.VITE_LANDING_V3 ?? '').toLowerCase() === 'true';

const LandingV3 = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    track('landing_viewed', { variant: 'v3', path: window.location.pathname });
  }, []);

  useEffect(() => {
    if (!heroRef.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setHeroInView(entry.isIntersecting);
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works-v3');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PreLoginPage>
      <StickyCtaBar heroInView={heroInView} />
      <div
        className="min-h-screen w-full max-w-[100vw] overflow-x-hidden"
        style={{
          background:
            'radial-gradient(ellipse 100% 35% at 50% 0%,    rgba(88, 28, 135, 0.07) 0%, transparent 60%), radial-gradient(ellipse 60%  50% at 0% 50%,    rgba(180, 20, 40, 0.07) 0%, transparent 55%), radial-gradient(ellipse 60%  50% at 100% 50%,  rgba(180, 80, 0, 0.06)  0%, transparent 55%), radial-gradient(ellipse 80%  30% at 50% 100%,  rgba(88, 28, 135, 0.06) 0%, transparent 50%), #0a0a0f',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        }}
      >
        <div ref={heroRef}>
          <FounderHero onSeeHowItWorksClick={scrollToHowItWorks} />
        </div>
        <ResultsBand />
        <FreeStack />
        <div id="how-it-works-v3">
          <HowItWorksPhases />
        </div>
        <FounderCredibility />
        <CreatorResults />
        <LibraryTeaser />
        <FaqV3 />
        <FinalCta />
      </div>
    </PreLoginPage>
  );
};

export default LandingV3;

