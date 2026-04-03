import { motion } from 'framer-motion';
import FeaturesList from '@/components/UI/FeaturesList';

interface DashboardHeaderProps {
    name: string;
    selectedFeatureIds: string[];
}

function DashboardHeader({ name, selectedFeatureIds }: DashboardHeaderProps) {
    // Get counter color
    const getCounterColor = () => {
        const count = selectedFeatureIds.length;
        if (count === 0) return 'border-orange-500 text-orange-500';
        if (count === 6) return 'border-green-500 text-green-500';
        return 'border-yellow-500 text-yellow-500';
    };

    return (
        <>
            {/* Background Gradient Circle */}
            <div className="absolute top-20 sm:top-32 left-1/2 transform -translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-primary rounded-full opacity-30 blur-3xl" />

            {/* Greeting */}
            <div className="text-center mb-3">
                <h3 className="text-white text-xl sm:text-3xl md:text-4xl font-impact font-bold leading-tight mb-1.5 tracking-wide uppercase">
                    Hello {name || 'User'}
                </h3>
                <p className="text-white/80 text-base sm:text-lg md:text-xl font-montserrat font-normal mb-4">
                    Please click on the cards to select the features you want to analyze & improve
                </p>
            </div>

            {/* Selection Counter - Moved to top, right under description */}
            <div className="flex justify-center">
                <motion.div
                    key={selectedFeatureIds.length}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`px-6 py-3 rounded-full border-2 transition-colors font-semibold text-sm sm:text-base md:text-lg ${getCounterColor()}`}
                >
                    <span className="uppercase">
                        ● {selectedFeatureIds.length} OUT OF 6 FEATURES SELECTED
                    </span>
                </motion.div>
            </div>

            {/* <FeaturesList /> */}
        </>
    )
}

export default DashboardHeader