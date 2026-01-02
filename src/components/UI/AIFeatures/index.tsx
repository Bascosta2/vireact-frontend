import FeatureCard from './FeatureCard';
import { aiFeatures } from './features-data';

function AIFeatures() {
    return (
        <div className="w-full bg-black">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {aiFeatures.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} />
                ))}
            </div>
        </div>
    );
}

export default AIFeatures;

