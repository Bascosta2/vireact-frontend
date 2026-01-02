import HomeSection from '@/components/HomeSection';
import FeatureCard from '@/components/Home/FeaturesSection/FeatureCard';
import { features } from '@/components/Home/FeaturesSection/features-items';

function FeaturesSection() {
    return (
        <HomeSection
            className="px-4"
            gradient={true}
            overflow="hidden"
            sectionHeader={{
                badge: "Features",
                title: "The only features you need for 100x growth"
            }}
        >
            {/* Grid layout for features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
                {features.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} />
                ))}
            </div>
        </HomeSection>
    );
}

export default FeaturesSection;