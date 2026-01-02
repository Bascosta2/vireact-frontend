import { type Feature } from '../features-data';

interface FeatureCardProps {
    feature: Feature;
}

function FeatureCard({ feature }: FeatureCardProps) {
    const IconComponent = feature.icon;

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Circular Icon Container */}
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center transition-all duration-300 hover:bg-gray-800">
                {typeof IconComponent === 'function' ? <IconComponent className="w-6 h-6 text-white" /> : IconComponent}
            </div>

            {/* Feature Name */}
            <span className="text-xs sm:text-sm text-white text-center whitespace-nowrap">
                {feature.name}
            </span>
        </div>
    );
}

export default FeatureCard;

