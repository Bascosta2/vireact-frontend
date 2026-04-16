import HomeSection from '@/components/HomeSection';
import StepCard from '@/components/Home/HowItWorks/StepCard';
import { howItWorksSteps } from '@/components/Home/HowItWorks/how-it-works-items';
import { useMobileHorizontalAutoScroll } from '@/hooks/useMobileHorizontalAutoScroll';

function HowItWorksSection() {
    const stepsScroll = useMobileHorizontalAutoScroll();

    return (
        <HomeSection
            gradient={false}
            overflow="hidden"
            background="transparent"
            sectionHeader={{
                badge: "How It Works",
                title: "The Easiest Way to Go Viral"
            }}
        >
            <div
                ref={stepsScroll.scrollRef}
                {...stepsScroll.touchHandlers}
                className="md:hidden overflow-x-auto scrollbar-hide flex flex-row gap-4 px-4 pb-2 max-w-7xl mx-auto w-full"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                {howItWorksSteps.map((step) => {
                    const IconComponent = step.icon;
                    return (
                        <div
                            key={step.id}
                            className="relative shrink-0 w-[220px] rounded-2xl border border-red-500/40 bg-gray-900 p-5 flex flex-col items-center text-center gap-3"
                        >
                            <div className="absolute -top-2 -left-2 w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/20 bg-black">
                                <span className="text-white font-bold text-sm">{step.id}</span>
                            </div>
                            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mt-2">
                                <IconComponent className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-bold uppercase text-white leading-tight">
                                {step.title}
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="hidden md:grid grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto w-full">
                {howItWorksSteps.map((step) => (
                    <StepCard key={step.id} step={step} />
                ))}
            </div>
        </HomeSection>
    );
}

export default HowItWorksSection;
