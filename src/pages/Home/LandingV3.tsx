import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import { track } from '@/lib/analytics';
import { StickyCtaBar } from '@/components/marketing/landing-v3/StickyCtaBar';
import { FounderHero } from '@/components/marketing/landing-v3/FounderHero';
import { ResultsBand } from '@/components/marketing/landing-v3/ResultsBand';

const BelowFold = lazy(() => import('@/components/marketing/landing-v3/BelowFold'));

const LandingV3 = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    track('landing_viewed', { variant: 'v3', path: window.location.pathname });
  }, []);

  useEffect(() => {
    const node = heroRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setHeroInView(entry.isIntersecting)),
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works-v3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PreLoginPage>
      <StickyCtaBar heroInView={heroInView} />
      <main
        className="min-h-screen w-full max-w-[100vw] overflow-x-hidden pb-20 md:pb-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 35% at 50% 0%, rgba(88, 28, 135, 0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 0% 50%, rgba(180, 20, 40, 0.07) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 100% 50%, rgba(180, 80, 0, 0.06) 0%, transparent 55%), #0a0a0f',
        }}
      >
        <div ref={heroRef} data-section="hero">
          <FounderHero onSeeHowItWorksClick={scrollToHowItWorks} />
        </div>
        <ResultsBand />
        <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
          <BelowFold />
        </Suspense>
      </main>
    </PreLoginPage>
  );
};

export default LandingV3;
