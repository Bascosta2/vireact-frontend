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

                {/* 2. Three feature cards + AI feature tabs (all viewports) */}
                <section className="relative" style={{ background: 'transparent' }}>
                    <DifferentiationSection />
                    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-2 md:pb-0">
                        <AIFeatures />
                    </div>
                </section>

                {/* Creator story cards */}
                <div style={{ background: 'transparent' }}>
                    <WinsSection />
                </div>

                <section style={{ background: 'transparent' }}>
                    <CreatorsAndBusinesses />
                </section>
                <section style={{ background: 'transparent' }}>
                    <ViralPredictionsSection />
                </section>

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
