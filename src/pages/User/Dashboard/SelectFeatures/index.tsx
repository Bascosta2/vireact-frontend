import FeatureCard from '@/components/User/Dashboard/FeatureCard';
import { FaChevronLeft, FaChevronRight, FaCheckSquare } from 'react-icons/fa';
import { useState, useRef, useCallback } from 'react';
import { features } from '@/components/User/Dashboard/FeatureCard/feature-items';


interface SelectFeaturesProps {
    selectedFeatureIds: string[];
    setSelectedFeatureIds: (ids: string[]) => void;
}


function SelectFeatures({ selectedFeatureIds, setSelectedFeatureIds }: SelectFeaturesProps) {
    const [currentFeature, setCurrentFeature] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const nextFeature = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    const prevFeature = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    const goToFeature = (index: number) => {
        if (isTransitioning || index === currentFeature) return;
        setIsTransitioning(true);
        setCurrentFeature(index);
        setTimeout(() => setIsTransitioning(false), 300);
    };

    const toggleFeature = (featureId: string) => {
        const newIds = selectedFeatureIds.includes(featureId)
            ? selectedFeatureIds.filter(id => id !== featureId)
            : [...selectedFeatureIds, featureId];
        setSelectedFeatureIds(newIds);
    };

    const handleSelectAll = useCallback(() => {
        if (selectedFeatureIds.length === features.length) {
            // Deselect all
            setSelectedFeatureIds([]);
        } else {
            // Select all
            setSelectedFeatureIds(features.map(f => f.id));
        }
    }, [selectedFeatureIds.length, setSelectedFeatureIds]);

    const isAllSelected = selectedFeatureIds.length === features.length;

    // Touch/Swipe handling
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        const startX = touch.clientX;
        const startY = touch.clientY;

        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;

            // Only handle horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    prevFeature();
                } else {
                    nextFeature();
                }
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            }
        };

        const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };

        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    };



    return (
        <>
            {/* Dynamic Feature Description */}
            <div className="text-center mb-4 sm:mb-6">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-white text-xl sm:text-2xl font-semibold mb-2">
                        {features[currentFeature].title}
                    </h2>
                    <p className="text-white/80 text-lg sm:text-xl font-roboto">
                        {features[currentFeature].description}
                    </p>
                </div>
            </div>

            {/* Select All Checkbox */}
            <div className="flex justify-center mb-6 sm:mb-8">
                <button
                    onClick={handleSelectAll}
                    className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300"
                >
                    <div className={`relative w-6 h-6 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${
                        isAllSelected 
                            ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-500' 
                            : 'border-white/40 group-hover:border-white/60'
                    }`}>
                        {isAllSelected && (
                            <FaCheckSquare className="w-4 h-4 text-white" />
                        )}
                    </div>
                    <span className="text-white font-medium text-sm sm:text-base">
                        {isAllSelected ? 'Deselect All Features' : 'Select All Features'}
                    </span>
                    <span className="text-white/60 text-xs sm:text-sm">
                        ({selectedFeatureIds.length}/{features.length})
                    </span>
                </button>
            </div>

            {/* Feature Slideshow */}
            <div className="mb-12 sm:mb-16">
                <div className="flex justify-center items-center px-8 sm:px-0">
                    <div
                        ref={containerRef}
                        className="relative w-full max-w-md"
                        onTouchStart={handleTouchStart}
                    >
                        {/* Desktop Navigation Arrows */}
                        <button
                            onClick={prevFeature}
                            disabled={isTransitioning}
                            className="hidden sm:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 transition-all duration-300 disabled:opacity-50"
                        >
                            <FaChevronLeft className="w-5 h-5 text-white" />
                        </button>

                        <button
                            onClick={nextFeature}
                            disabled={isTransitioning}
                            className="hidden sm:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 transition-all duration-300 disabled:opacity-50"
                        >
                            <FaChevronRight className="w-5 h-5 text-white" />
                        </button>

                        {/* Single Centered Card */}
                        <div className="flex justify-center items-center relative">
                            {/* Mobile Chevrons - Positioned relative to card */}
                            <button
                                onClick={prevFeature}
                                disabled={isTransitioning}
                                className="absolute -left-6 top-1/2 transform -translate-y-1/2 -translate-x-2 sm:hidden z-20 bg-transparent backdrop-blur-sm rounded-full p-3 transition-all duration-300 disabled:opacity-50"
                            >
                                <FaChevronLeft className="w-5 h-5 text-white" />
                            </button>

                            <button
                                onClick={nextFeature}
                                disabled={isTransitioning}
                                className="absolute -right-6 top-1/2 transform -translate-y-1/2 translate-x-2 sm:hidden z-20 bg-transparent backdrop-blur-sm rounded-full p-3 transition-all duration-300 disabled:opacity-50"
                            >
                                <FaChevronRight className="w-5 h-5 text-white" />
                            </button>

                            <div
                                className={`
                    transition-all duration-300 ease-out transform
                    ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                  `}
                            >
                                <FeatureCard
                                    Icon={features[currentFeature].icon}
                                    title={features[currentFeature].title}
                                    isSelected={selectedFeatureIds.includes(features[currentFeature].id)}
                                    onSelect={() => toggleFeature(features[currentFeature].id)}
                                    className="w-64 sm:w-72"
                                />
                            </div>
                        </div>

                        {/* Dots Indicator */}
                        <div className="flex justify-center gap-2">
                            {features.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToFeature(index)}
                                    disabled={isTransitioning}
                                    className={`
                      w-3 h-3 rounded-full transition-all duration-300 disabled:opacity-50
                      ${index === currentFeature
                                            ? 'bg-white scale-125'
                                            : 'bg-white/40 hover:bg-white/60'
                                        }
                    `}
                                />
                            ))}
                        </div>

                        {/* Mobile Navigation Hint */}
                        <div className="sm:hidden text-center mt-4">
                            <p className="text-white/60 text-sm">Swipe or tap arrows to navigate</p>
                        </div>
                    </div>
                </div>
            </div>



        </>
    )
}

export default SelectFeatures