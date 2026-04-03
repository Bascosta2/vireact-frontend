import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { type AIFeature } from '@/components/UI/AIFeatures/features-data';

interface FeatureCardProps {
    feature: AIFeature;
}

function FeatureCard({ feature }: FeatureCardProps) {
    const IconComponent = feature.icon;
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <motion.div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {showTooltip && feature.description && (
                <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-800 border border-gray-600 rounded-lg whitespace-nowrap z-10"
                >
                    {feature.description}
                </motion.span>
            )}
            <Link
                to={feature.route}
                className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-900 hover:border-gray-600 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                aria-label={`Navigate to ${feature.name}`}
                title={feature.description}
            >
                <motion.span
                    className="flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 1 }}
                >
                    <IconComponent
                        className="w-5 h-5 text-white flex-shrink-0"
                        aria-hidden="true"
                    />
                </motion.span>
                <span className="text-xs sm:text-sm text-white whitespace-nowrap">
                    {feature.name}
                </span>
            </Link>
        </motion.div>
    );
}

export default FeatureCard;
