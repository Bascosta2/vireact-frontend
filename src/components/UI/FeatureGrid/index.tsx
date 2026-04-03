import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  Volume2, 
  Eye, 
  BarChart3, 
  MessageSquare, 
  Check
} from 'lucide-react';
import { FEATURES_IDS } from '@/constants';

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Zap;
  color: string;
}

const features: Feature[] = [
  {
    id: FEATURES_IDS.HOOK,
    title: 'HOOK',
    subtitle: 'Analyze the first 3–5 seconds of your videos with precision. Our system breaks down your opening moments using proven viewer psychology patterns, revealing exactly why people stay or swipe. With stronger hooks, tighter framing, and better tension early on, you can dramatically increase your initial watch rate and keep far more viewers locked in from the start.',
    icon: Zap,
    color: 'from-pink-500 to-orange-500'
  },
  {
    id: FEATURES_IDS.PACING_RHYTHM,
    title: 'PACING & RHYTHM',
    subtitle: 'Fix video flow, optimize cuts, and find the perfect transitions. Videos with smooth pacing and storytelling structure based off of real viewer statistics and psychology are more likely to go viral.',
    icon: Activity,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: FEATURES_IDS.AUDIO,
    title: 'AUDIO',
    subtitle: 'Our AI examines every layer of your audio, from dialogue clarity to background music choice and sound effect timing. Using acoustic analysis and engagement modeling, it identifies what enhances immersion and what harms retention.',
    icon: Volume2,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: FEATURES_IDS.VIEWS,
    title: 'VIEWS',
    subtitle: 'Get a clear prediction of how your video will perform using real, data backed intelligence. Our AI models are trained on thousands of high performing short form videos and use advanced statistical algorithms to evaluate your pacing, hook strength, retention patterns, and overall storytelling.',
    icon: Eye,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: FEATURES_IDS.ADVANCED_ANALYTICS,
    title: 'ADVANCED ANALYTICS',
    subtitle: 'Take a deep dive into the analytics behind your video and understand exactly why it\'s performing, or underperforming, at a numerical, data backed level. Our system breaks down every metric that matters, translating raw numbers into clear insights.',
    icon: BarChart3,
    color: 'from-orange-500 to-yellow-500'
  },
  {
    id: FEATURES_IDS.CAPTION,
    title: 'CAPTION',
    subtitle: 'Analyze your captions to ensure they\'re boosting, not hurting, your video\'s impact. Our system evaluates readability, timing, pacing, clarity, and keyword strength, then gives you precise recommendations to make your captions more engaging and viewer friendly.',
    icon: MessageSquare,
    color: 'from-indigo-500 to-purple-500'
  }
];

interface FeatureGridProps {
  selectedFeatureIds: string[];
  setSelectedFeatureIds: (ids: string[]) => void;
}

function FeatureGrid({ selectedFeatureIds, setSelectedFeatureIds }: FeatureGridProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const toggleFeature = (featureId: string) => {
    if (selectedFeatureIds.includes(featureId)) {
      setSelectedFeatureIds(selectedFeatureIds.filter((id: string) => id !== featureId));
    } else {
      setSelectedFeatureIds([...selectedFeatureIds, featureId]);
    }
  };

  const getCardGlowColor = (featureId: string, isSelected: boolean, isHovered: boolean) => {
    const glowColors: Record<string, string> = {
      [FEATURES_IDS.HOOK]: 'rgba(236, 72, 153, 0.6)',
      [FEATURES_IDS.PACING_RHYTHM]: 'rgba(168, 85, 247, 0.6)',
      [FEATURES_IDS.AUDIO]: 'rgba(59, 130, 246, 0.6)',
      [FEATURES_IDS.VIEWS]: 'rgba(34, 197, 94, 0.6)',
      [FEATURES_IDS.ADVANCED_ANALYTICS]: 'rgba(251, 146, 60, 0.6)',
      [FEATURES_IDS.CAPTION]: 'rgba(99, 102, 241, 0.6)'
    };

    const baseColor = glowColors[featureId] || 'rgba(239, 68, 68, 0.6)';
    
    if (isSelected) {
      return `0 0 40px ${baseColor}, 0 0 80px ${baseColor}, 0 8px 30px rgba(0, 0, 0, 0.4)`;
    }
    if (isHovered) {
      return `0 0 30px ${baseColor}, 0 4px 20px rgba(0, 0, 0, 0.3)`;
    }
    return `0 0 20px ${baseColor}, 0 4px 15px rgba(0, 0, 0, 0.2)`;
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 sm:py-6 lg:py-8 overflow-x-hidden">
      {/* Cards Grid */}
      <div className="w-full max-w-7xl px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {features.map((feature, index) => {
            const isSelected = selectedFeatureIds.includes(feature.id);
            const isHovered = hoveredCard === feature.id;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative aspect-[3/4] rounded-2xl sm:rounded-3xl bg-gradient-to-br ${feature.color} backdrop-blur-xl bg-opacity-10 cursor-pointer overflow-hidden transition-all duration-300 transform hover:scale-[1.02] hover:z-10 ${
                  isSelected
                    ? 'ring-4 ring-green-500 shadow-2xl'
                    : 'ring-2 ring-white/20'
                }`}
                style={{
                  boxShadow: getCardGlowColor(feature.id, isSelected, isHovered)
                }}
                onClick={() => toggleFeature(feature.id)}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFeature(feature.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`${feature.title} feature card. ${isSelected ? 'Selected' : 'Not selected'}`}
              >
                {/* Icon Container with Glow */}
                <div className="absolute top-8 sm:top-12 left-1/2 -translate-x-1/2 z-10">
                  <div className={`
                    w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
                    rounded-full backdrop-blur-md
                    flex items-center justify-center border-2 overflow-hidden
                    transition-all duration-500 p-2
                    ${isSelected
                      ? 'bg-green-500/30 border-green-400'
                      : 'bg-red-500/20 border-red-400/50'
                    }`}
                    style={{
                      boxShadow: isSelected
                        ? '0 0 25px rgba(34, 197, 94, 0.5)'
                        : '0 0 20px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <feature.icon 
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-colors flex-shrink-0 ${
                        isSelected ? 'text-green-200' : 'text-red-200'
                      }`} 
                      strokeWidth={2} 
                    />
                  </div>
                </div>

                {/* Dark overlay for text readability */}
                <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-b-2xl sm:rounded-b-3xl z-5" />

                {/* Title */}
                <h3 className="absolute top-28 sm:top-32 md:top-36 left-0 right-0 text-center text-lg sm:text-xl md:text-2xl font-bold text-white px-4 z-10 drop-shadow-lg">
                  {feature.title}
                </h3>

                {/* Description - scrollable area */}
                <div className="absolute top-40 sm:top-44 md:top-48 left-0 right-0 bottom-4 sm:bottom-6 px-3 sm:px-4 md:px-6 overflow-y-auto z-10">
                  <p className="text-center text-white/95 text-xs sm:text-sm leading-relaxed drop-shadow-lg"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {feature.subtitle}
                  </p>
                </div>

                {/* Selection Checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-20 ring-4 ring-green-400/30"
                    style={{
                      boxShadow: '0 0 30px rgba(34, 197, 94, 0.8), 0 4px 20px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <Check className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" strokeWidth={4} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FeatureGrid;
