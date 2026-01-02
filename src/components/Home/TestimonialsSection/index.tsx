import TestimonialsCard from '@/components/Home/TestimonialsSection/TestimonialsCard';
import CustomMarquee from '@/components/UI/Marquee';
import HomeSection from '@/components/HomeSection';
import { testimonials } from '@/components/Home/TestimonialsSection/testimonials-items';

function TestimonialsSection() {

    return (
        <HomeSection
            className="overflow-hidden"
            background="transparent"
            padding="small"
            overflow="hidden"
            sectionHeader={{
                badge: "What Our Users Achieved",
                title: "Stop Guessing, Start Trending"
            }}
        >
            {/* Main content card */}
            <div className="relative z-10 w-full max-w-7xl mx-auto py-12
                glassmorphism shadow-lg overflow-hidden])]"
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
                        {testimonials.map((testimonial) => (
                                <TestimonialsCard
                                    testimonial={testimonial}
                                />
                        ))}
                    </CustomMarquee>
                </div>
            </div>
        </HomeSection>
    );
}

export default TestimonialsSection;