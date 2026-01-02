import CustomMarquee from '@/components/UI/Marquee';
import { analyticsItems } from './analytics-items';

function AnalyticsScreenshots() {
    return (
        <div className="w-full max-w-7xl mx-auto py-2">
            {/* Heading */}
            <div className="flex justify-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Wins
                </h2>
            </div>

            {/* Screenshots Marquee */}
            <div>
                <CustomMarquee
                    speed={40}
                    direction="right"
                    pauseOnHover={false}
                    gradient={false}
                    className="py-4"
                >
                    {analyticsItems.map((screenshot, index) => (
                        <div
                            key={index}
                            className="mx-4 flex items-center"
                        >
                            <img
                                src={screenshot}
                                alt={`Analytics screenshot ${index + 1}`}
                                className="max-h-64 md:max-h-80 lg:max-h-96 w-auto object-contain rounded-lg shadow-lg"
                            />
                        </div>
                    ))}
                </CustomMarquee>
            </div>
        </div>
    );
}

export default AnalyticsScreenshots;