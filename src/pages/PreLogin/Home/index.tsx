import HeroSection from '@/components/Home/HeroSection';
import FeaturesSection from '@/components/Home/FeaturesSection';
import HowItWorksSection from '@/components/Home/HowItWorks';
import TestimonialsSection from '@/components/Home/TestimonialsSection';
import WhyChooseUsSection from '@/components/Home/WhyChooseUsSection';
import FAQSection from '@/components/Home/FAQSection';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import Niches from '@/components/FeaturesPage/Niches';
import AIFeatures from '@/components/UI/AIFeatures';
import CreatorsAndBusinesses from '@/components/FeaturesPage/CreatorsAndBusinesses';
import AnalyticsScreenshots from '@/components/Home/AnalyticsScreenshots';

function Home() {
    return (
        <PreLoginPage>
            {/* Hero Section */}
            <HeroSection />

            {/* AI Features */}
            <AIFeatures />

            {/* Creators and Businesses Section */}
            <CreatorsAndBusinesses />

            {/* Niches Slideshow Section */}
            <Niches />

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* Analytics Screenshots Section */}
            <AnalyticsScreenshots />


            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Features Section */}
            <FeaturesSection />

            {/* Why Choose Us Section */}
            <WhyChooseUsSection />

            {/* FAQ Section */}
            <FAQSection />
        </PreLoginPage>
    );
}

export default Home;