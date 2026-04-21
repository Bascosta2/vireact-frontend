import HeroSection from '@/components/Home/HeroSection';
import DifferentiationSection from '@/components/Home/DifferentiationSection';
import WinsSection from '@/components/Home/WinsSection';
import ViralPredictionsSection from '@/components/Home/ViralPredictionsSection';
import FeaturesSection from '@/components/Home/FeaturesSection';
import HowItWorksSection from '@/components/Home/HowItWorks';
import WhyChooseUsSection from '@/components/Home/WhyChooseUsSection';
import FAQSection from '@/components/Home/FAQSection';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import AIFeatures from '@/components/UI/AIFeatures';
import CreatorsAndBusinesses from '@/components/FeaturesPage/CreatorsAndBusinesses';

function Home() {
    return (
        <PreLoginPage>
            <div
                className="min-h-screen w-full max-w-[100vw] overflow-x-hidden"
                style={{
                    background:
                        'radial-gradient(ellipse 100% 35% at 50% 0%,    rgba(88, 28, 135, 0.07) 0%, transparent 60%), radial-gradient(ellipse 60%  50% at 0% 50%,    rgba(180, 20, 40, 0.07) 0%, transparent 55%), radial-gradient(ellipse 60%  50% at 100% 50%,  rgba(180, 80, 0, 0.06)  0%, transparent 55%), radial-gradient(ellipse 80%  30% at 50% 100%,  rgba(88, 28, 135, 0.06) 0%, transparent 50%), #0a0a0f',
                    backgroundAttachment: 'fixed',
                    minHeight: '100vh',
                }}
            >
                {/* 1. Hero */}
                <HeroSection />

                {/*
                  Mobile-only reorder wrapper.
                  On mobile, this is a flex column and `order-*` controls visual order so
                  the sequence is: badges → testimonials → creator circles → carousel → from-idea-to-viral.
                  On desktop (md+), `md:contents` removes the wrapper from the box tree and the
                  source-order flow is preserved exactly as before: carousel → badges → testimonials
                  → creator circles → from-idea-to-viral. `order-*` has no effect in block flow.
                */}
                <div className="flex flex-col md:contents">
                    {/* 2. Three feature cards carousel (mobile) / grid (desktop) */}
                    <section className="order-4 md:order-1 relative" style={{ background: 'transparent' }}>
                        <DifferentiationSection />
                    </section>

                    {/* 3. AI feature badges */}
                    <section className="order-1 md:order-2 relative" style={{ background: 'transparent' }}>
                        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-2 md:pb-0">
                            <AIFeatures />
                        </div>
                    </section>

                    {/* 4. Creator story cards / testimonials */}
                    <div className="order-2 md:order-3" style={{ background: 'transparent' }}>
                        <WinsSection />
                    </div>

                    {/* 5. Creator avatars + brand logos */}
                    <section className="order-3 md:order-4" style={{ background: 'transparent' }}>
                        <CreatorsAndBusinesses />
                    </section>

                    {/* 6. From idea to viral */}
                    <section className="order-5 md:order-5" style={{ background: 'transparent' }}>
                        <ViralPredictionsSection />
                    </section>
                </div>

                <section style={{ background: 'transparent' }}>
                    <HowItWorksSection />
                    <FeaturesSection />
                    <WhyChooseUsSection />
                    <FAQSection />
                </section>
            </div>
        </PreLoginPage>
    );
}

export default Home;
