import HomeSection from '@/components/HomeSection';
import StepCard from '@/components/Home/HowItWorks/StepCard';
import { howItWorksSteps } from '@/components/Home/HowItWorks/how-it-works-items';

function HowItWorksSection() {
    return (
        <HomeSection
            className="px-4"
            gradient={false}
            overflow="hidden"
            sectionHeader={{
                badge: "How It Works",
                title: "The Easiest Way to Go Viral"
            }}
        >
            {/* Grid layout for steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
                {howItWorksSteps.map((step) => (
                    <StepCard key={step.id} step={step} />
                ))}
            </div>
        </HomeSection>
    );
}

export default HowItWorksSection;