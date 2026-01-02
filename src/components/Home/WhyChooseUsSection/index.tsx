import HomeSection  from '@/components/HomeSection';
import CustomMarquee  from '@/components/UI/Marquee';
import WhyChooseUsCard from '@/components/Home/WhyChooseUsSection/WhyChooseUsCard';
import { whyChooseUsItems } from '@/components/Home/WhyChooseUsSection/why-choose-us-items';

function WhyChooseUsSection() {
    return (
        <HomeSection 
            className="overflow-hidden"
            background="transparent"
            padding="small"
            overflow="hidden"
            sectionHeader={{
                badge: "CHOOSE US",
                title: "WHY CREATORS LOVE US"
            }}
        >
            {/* Main content card */}
            <div className="relative z-10 w-full max-w-7xl mx-auto py-12
                glassmorphism shadow-lg overflow-hidden"
            >
                {/* Infinite Ticker Container */}
                <div className="relative">
                    <CustomMarquee
                        speed={40}
                        direction="left"
                        pauseOnHover={false}
                        gradient={false}
                        className="py-4"
                    >
                        {whyChooseUsItems.map((item: any, index: number) => (
                            <WhyChooseUsCard
                                key={item.id}
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