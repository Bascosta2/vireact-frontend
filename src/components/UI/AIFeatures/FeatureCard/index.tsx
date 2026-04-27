import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { type AIFeature } from '@/components/UI/AIFeatures/features-data';

interface FeatureCardProps {
    feature: AIFeature;
}

function FeatureCard({ feature }: FeatureCardProps) {
    const IconComponent = feature.icon;
    const [showTooltip, setShowTooltip] = useState(false);
    const [isMdUp, setIsMdUp] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const apply = () => setIsMdUp(mq.matches);
        apply();
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, []);

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
                    className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 px-3 py-2 text-xs text-white bg-gray-800 border border-gray-600 rounded-lg whitespace-nowrap md:top-auto md:bottom-full md:mb-2 md:mt-0"
                >
                    {feature.description}
                </motion.span>
            )}
            <Link
                to={feature.route}
                className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 bg-black border border-gray-700 rounded-lg hover:bg-gray-900 hover:border-gray-600 max-md:transition-shadow max-md:duration-200 max-md:hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] md:transition-all md:duration-300 md:hover:-translate-y-0.5 md:hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                aria-label={`Navigate to ${feature.name}`}
                title={feature.description}
            >
                <motion.span
                    className="flex items-center justify-center"
                    whileHover={isMdUp ? { rotate: 360 } : undefined}
                    transition={{ duration: 1 }}
                >
                    <IconComponent
                        className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0"
                        aria-hidden="true"
                    />
                </motion.span>
                <span className="text-[11px] md:text-sm text-white whitespace-nowrap">
                    {feature.name}
                </span>
            </Link>
        </motion.div>
    );
}

export default FeatureCard;
