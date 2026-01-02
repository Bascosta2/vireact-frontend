import CustomMarquee from '@/components/UI/Marquee';
import NicheCard from './NicheCard';
import { nicheData } from './niche-data';

interface Niche {
    id: string;
    category: string;
    alt: string;
    thumbnail: string;
    isFounder?: boolean;
}

function Niches() {
    return (
        <div className="w-full max-w-7xl mx-auto py-16">
            {/* Header Section */}
            <div className="text-center mb-12">
                <h3 className="font-bold !text-white mb-4">
                    FROM IDEA TO VIRAL, {' '}
                    <span className="text-gradient-primary">INSTANT PREDICTIONS MADE EASY</span> 
                </h3>
            </div>

            {/* Content Cards Section */}
            <div className="relative overflow-hidden">
                <CustomMarquee
                    speed={100}
                    direction="right"
                    pauseOnHover={false}
                    gradient={false}
                    className="py-4"
                >
                    {nicheData.map((niche: Niche) => (
                        <NicheCard
                            key={niche.id}
                            category={niche.category}
                            alt={niche.alt}
                            thumbnail={niche.thumbnail}
                            isFounder={niche.isFounder}
                        />
                    ))}
                </CustomMarquee>
            </div>
        </div>
    );
}

export default Niches;
