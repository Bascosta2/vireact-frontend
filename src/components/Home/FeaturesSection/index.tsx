import HomeSection from '@/components/HomeSection';
import FeatureCard from '@/components/Home/FeaturesSection/FeatureCard';
import { features } from '@/components/Home/FeaturesSection/features-items';
import { useMobileHorizontalAutoScroll } from '@/hooks/useMobileHorizontalAutoScroll';

function FeaturesSection() {
    const featuresScroll = useMobileHorizontalAutoScroll();

    return (
        <HomeSection
            gradient={true}
            overflow="hidden"
            background="transparent"
            sectionHeader={{
                badge: "Features",
                title: "The only features you need for 100x growth"
            }}
        >
            <div
                ref={featuresScroll.scrollRef}
                {...featuresScroll.touchHandlers}
                className="md:hidden overflow-x-auto scrollbar-hide flex flex-row gap-4 px-4 pb-2 max-w-7xl mx-auto w-full"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {features.map((feature) => (
                    <div
                        key={feature.id}
                        className="relative shrink-0 w-[220px] rounded-2xl border border-red-500/40 bg-gray-900 p-5 flex flex-col items-center text-center gap-3"
                    >
                        <div className="absolute -top-2 -left-2 w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/20 bg-black">
                            <span className="text-white font-bold text-sm">{feature.id}</span>
                        </div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider mt-2">
                            {feature.creativeText}
                        </span>
                        <div className="flex items-center justify-center gap-2">
                            {feature.icons.map((iconSrc, index) => (
                                <img
                                    key={index}
                                    src={iconSrc}
                                    alt=""
                                    className="w-8 h-8 object-contain"
                                />
                            ))}
                        </div>
                        <h3 className="text-sm font-bold uppercase text-white leading-tight">
                            {feature.title}
                        </h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="hidden md:grid grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto w-full">
                {features.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} />
                ))}
            </div>
        </HomeSection>
    );
}

export default FeaturesSection;
