import FeatureCard from './FeatureCard';
import { featuresList } from './features-data';

function FeaturesList() {
    return (
        <div className="w-full bg-black">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {featuresList.map((feature) => (
                    <FeatureCard key={feature.id} 
                    feature={feature} />
                ))}
            </div>
        </div>
    );
}

export default FeaturesList;

