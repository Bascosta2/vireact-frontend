import { Link } from 'react-router-dom';
import { type AIFeature } from '@/components/UI/AIFeatures/features-data';

interface FeatureCardProps {
    feature: AIFeature;
}

function FeatureCard({ feature }: FeatureCardProps) {
    const IconComponent = feature.icon;

    return (
        <Link
            to={feature.route}
            className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg transition-all duration-300 hover:bg-gray-900 hover:border-gray-600"
            aria-label={`Navigate to ${feature.name}`}
        >
            {/* Icon */}
            <IconComponent 
                className="w-5 h-5 text-white flex-shrink-0" 
                aria-hidden="true"
            />

            {/* Feature Name */}
            <span className="text-xs sm:text-sm text-white whitespace-nowrap">
                {feature.name}
            </span>
        </Link>
    );
}

export default FeatureCard;

