import HomeSection from '@/components/HomeSection';
import CustomMarquee from '@/components/UI/Marquee';
import WhyChooseUsCard from '@/components/Home/WhyChooseUsSection/WhyChooseUsCard';
import { whyChooseUsItems } from '@/components/Home/WhyChooseUsSection/why-choose-us-items';
import { useMobileHorizontalAutoScroll } from '@/hooks/useMobileHorizontalAutoScroll';

function WhyChooseUsSection() {
    const benefitsScroll = useMobileHorizontalAutoScroll();

    return (
        <HomeSection
            className="overflow-x-hidden"
            background="transparent"
            padding="small"
            overflow="hidden"
            sectionHeader={{
                badge: "CHOOSE US",
                title: "WHY CREATORS LOVE US"
            }}
        >
            <div className="relative z-10 w-full max-w-7xl mx-auto py-8 md:py-12 glassmorphism shadow-lg overflow-hidden">
                <div
                    ref={benefitsScroll.scrollRef}
                    {...benefitsScroll.touchHandlers}
                    className="md:hidden overflow-x-auto scrollbar-hide flex flex-row gap-4 px-4 pb-2 w-full"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {whyChooseUsItems.map((item, index) => (
                        <div
                            key={`${item.title}-${index}`}
                            className="shrink-0 w-[220px] rounded-2xl border border-red-500/40 bg-gray-900 p-5 flex flex-col items-center text-center gap-3"
                        >
                            <img
                                src={item.icon}
                                alt=""
                                className="w-12 h-12 object-contain"
                            />
                            <h3 className="text-sm font-bold uppercase text-white leading-tight">
                                {item.title}
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="relative hidden md:block">
                    <CustomMarquee
                        speed={40}
                        direction="left"
                        pauseOnHover={false}
                        gradient={false}
                        className="py-4"
                    >
                        {whyChooseUsItems.map((item, index) => (
                            <WhyChooseUsCard
                                key={`${item.title}-${index}`}
                                card={item}
                                index={index}
                            />
                        ))}
                    </CustomMarquee>
                </div>
            </div>
        </HomeSection>
    );
}

export default WhyChooseUsSection;
