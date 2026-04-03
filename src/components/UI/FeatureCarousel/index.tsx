import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  Volume2, 
  Eye, 
  BarChart3, 
  MessageSquare, 
  Check, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { FEATURES_IDS, VITE_BACKEND_URL } from '@/constants';

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

interface FeatureCarouselProps {
  selectedFeatureIds: string[];
  setSelectedFeatureIds: (ids: string[]) => void;
}

function FeatureCarousel({ selectedFeatureIds, setSelectedFeatureIds }: FeatureCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Frontend configuration check
  useEffect(() => {
    console.log('🔍 ========== FRONTEND CONFIGURATION ==========');
    console.log('🌐 VITE_BACKEND_URL (resolved):', VITE_BACKEND_URL || '❌ Not set');
    console.log('🌐 VITE_FRONTEND_URL:', import.meta.env.VITE_FRONTEND_URL || '❌ Not set');
    console.log('🌍 Environment:', import.meta.env.MODE || 'unknown');
    console.log('===============================================');
  }, []);

  // Console logging for debugging
  useEffect(() => {
    console.log('🎯 Feature Carousel - Selected Features:', selectedFeatureIds);
    console.log('📊 Current Index:', currentIndex);
    console.log('📝 Feature details:', features.filter(f => selectedFeatureIds.includes(f.id)).map(f => ({ id: f.id, title: f.title })));
  }, [selectedFeatureIds, currentIndex]);

  // Comprehensive backend health check on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      const backendUrl =
        VITE_BACKEND_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
      console.log('🔍 ========== BACKEND CONNECTION CHECK ==========');
      if (!backendUrl) {
        console.warn(
          '⚠️ Skipping backend health check: VITE_BACKEND_URL is not set. For production builds set it (see env.production.sample).'
        );
        console.log('===============================================');
        return;
      }
      console.log('🌐 Backend URL:', backendUrl);
      console.log('🔗 Health endpoint:', `${backendUrl}/api/health`);
      
      try {
        const response = await fetch(`${backendUrl}/api/health`);
        
        if (!response.ok) {
          console.error('❌ Backend not responding:', response.status, response.statusText);
          return;
        }
        
        const data = await response.json();
        
        console.log('🏥 Backend Health Status:');
        console.log('  📊 Status:', data.status);
        console.log('  🌍 Environment:', data.environment || 'unknown');
        console.log('  📦 MongoDB:', data.services?.mongo ? '✅ Connected' : '❌ Disconnected');
        if (data.mongodb) {
          console.log('    └─ Host:', data.mongodb.host);
          console.log('    └─ Database:', data.mongodb.database);
        }
        console.log('  🔴 Redis:', data.services?.redis ? '✅ Connected' : '⚠️ Not configured (optional)');
        console.log('  🎥 Twelve Labs:', data.services?.twelveLabs ? '✅ Configured' : '❌ Not configured');
        console.log('  🤖 OpenAI:', data.services?.openai ? '✅ Configured' : '❌ Not configured');
        console.log('  🔐 JWT:', data.services?.jwt ? '✅ Configured' : '❌ Not configured');
        console.log('  🖥️ Server:', data.services?.server ? '✅ Running' : '❌ Down');
        
        // Warnings
        if (!data.services?.mongo) {
          console.warn('⚠️ MongoDB not connected - video analysis will not work');
        }
        if (!data.services?.twelveLabs) {
          console.warn('⚠️ Twelve Labs API not configured - video processing will fail');
        }
        if (!data.services?.openai) {
          console.warn('⚠️ OpenAI API not configured - AI feedback will not work');
        }
        
        console.log('✅ Backend connection check complete');
        console.log('===============================================');
      } catch (error: any) {
        console.error('❌ Backend health check failed:', error.message);
        console.error('   This may indicate:');
        console.error('   - Backend server is not running');
        console.error('   - Backend URL is incorrect:', backendUrl);
        console.error('   - CORS is blocking the request');
        console.error('   - Network connectivity issues');
        console.log('===============================================');
      }
    };

    checkBackendHealth();
  }, []);

  // Auto-advance functionality
  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % features.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [currentIndex, isPaused]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2000);
  };

  const goToNext = useCallback(() => {
    console.log('➡️ Navigating to next feature');
    setCurrentIndex((prev) => (prev + 1) % features.length);
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 2000);
  }, []);

  const goToPrevious = useCallback(() => {
    console.log('⬅️ Navigating to previous feature');
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 2000);
  }, []);

  const jumpToCard = useCallback((index: number) => {
    console.log('🎯 Jumping to card:', index, features[index].title);
    setCurrentIndex(index);
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 2000);
  }, []);

  const toggleFeature = useCallback((featureId: string) => {
    const feature = features.find(f => f.id === featureId);
    console.log('🔄 ========== FEATURE SELECTION ==========');
    console.log('🎯 Toggling feature:', featureId);
    console.log('📝 Feature name:', feature?.title);
    
    const isCurrentlySelected = selectedFeatureIds.includes(featureId);
    const newSelection = isCurrentlySelected
      ? selectedFeatureIds.filter((id: string) => id !== featureId)
      : [...selectedFeatureIds, featureId];

    console.log(`${isCurrentlySelected ? '➖ Deselected' : '➕ Selected'}:`, feature?.title);
    console.log('📊 Previous selection:', selectedFeatureIds);
    console.log('📊 New selection array:', newSelection);
    console.log('📈 Total selected:', newSelection.length, 'out of', features.length);

    const validFeatureIds = [
      FEATURES_IDS.HOOK,
      FEATURES_IDS.PACING_RHYTHM,
      FEATURES_IDS.AUDIO,
      FEATURES_IDS.VIEWS,
      FEATURES_IDS.ADVANCED_ANALYTICS,
      FEATURES_IDS.CAPTION
    ];
    const invalidIds = newSelection.filter((id: string) => !validFeatureIds.includes(id));
    if (invalidIds.length > 0) {
      console.warn('⚠️ Invalid feature IDs detected:', invalidIds);
    } else {
      console.log('✅ All feature IDs are valid for backend');
    }
    console.log('==========================================');

    setSelectedFeatureIds(newSelection);
  }, [selectedFeatureIds, setSelectedFeatureIds]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToNext, goToPrevious]);

  // Touch swipe handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }
    touchStartRef.current = null;
  };

  // Get normalized offset from center (-2 to +2, with wrapping)
  const getVisibleOffset = (index: number, currentIndex: number, total: number): number => {
    let offset = index - currentIndex;
    // Normalize to shortest path around circle
    if (offset > total / 2) {
      offset = offset - total;
    } else if (offset < -total / 2) {
      offset = offset + total;
    }
    return offset;
  };

  // Get card pose (transform properties) based on offset from center
  const getCardPose = (offset: number) => {
    switch (offset) {
      case 0: // Center
        return {
          x: 0,
          z: 0,
          rotateY: 0,
          scale: 1.0,
          opacity: 1.0,
          zIndex: 50,
          brightness: 1.2,
          circleSize: 'w-18 h-18 sm:w-20 sm:h-20',
          iconSize: 'w-9 h-9 sm:w-10 sm:h-10' // Icon smaller than circle
        };
      case -1: // Left -1
        return {
          x: -200,
          z: -100,
          rotateY: 18,
          scale: 0.82,
          opacity: 0.78,
          zIndex: 40,
          brightness: 0.8,
          circleSize: 'w-16 h-16',
          iconSize: 'w-8 h-8' // Icon smaller than circle
        };
      case -2: // Left -2
        return {
          x: -380,
          z: -220,
          rotateY: 32,
          scale: 0.66,
          opacity: 0.55,
          zIndex: 30,
          brightness: 0.7,
          circleSize: 'w-14 h-14',
          iconSize: 'w-7 h-7' // Icon smaller than circle
        };
      case 1: // Right +1
        return {
          x: 200,
          z: -100,
          rotateY: -18,
          scale: 0.82,
          opacity: 0.78,
          zIndex: 40,
          brightness: 0.8,
          circleSize: 'w-16 h-16',
          iconSize: 'w-8 h-8' // Icon smaller than circle
        };
      case 2: // Right +2
        return {
          x: 380,
          z: -220,
          rotateY: -32,
          scale: 0.66,
          opacity: 0.55,
          zIndex: 30,
          brightness: 0.7,
          circleSize: 'w-14 h-14',
          iconSize: 'w-7 h-7' // Icon smaller than circle
        };
      default: // Hidden cards
        return {
          x: offset > 0 ? 600 : -600,
          z: -300,
          rotateY: offset > 0 ? -60 : 60,
          scale: 0.4,
          opacity: 0,
          zIndex: 10,
          brightness: 0.5,
          circleSize: 'w-12 h-12',
          iconSize: 'w-6 h-6'
        };
    }
  };

  // Get transform string for CSS
  const getTransformString = (pose: ReturnType<typeof getCardPose>) => {
    return `translate(-50%, -50%) translateX(${pose.x}px) translateZ(${pose.z}px) rotateY(${pose.rotateY}deg) scale(${pose.scale})`;
  };

  // Memoize card poses to prevent recalculation on hover state changes
  const cardPoses = useMemo(() => {
    return features.map((_, index) => {
      const offset = getVisibleOffset(index, currentIndex, features.length);
      return {
        index,
        offset,
        pose: getCardPose(offset)
      };
    });
  }, [currentIndex]);

  // Get card transform based on position relative to center (memoized)
  const getCardTransform = useCallback((index: number) => {
    const cached = cardPoses.find(p => p.index === index);
    return cached ? cached.pose : getCardPose(0);
  }, [cardPoses]);

  // Get glow shadow based on feature gradient and selection state (no window.innerWidth dependency)
  const getCardGlowColor = (featureId: string, isSelected: boolean, isHovered: boolean) => {
    const glowColors: Record<string, { selected: string; unselected: string; hover: string }> = {
      [FEATURES_IDS.HOOK]: {
        selected: '0 0 50px rgba(236, 72, 153, 0.8), 0 0 100px rgba(251, 146, 60, 0.5)',  // Pink-Orange glow
        unselected: '0 0 30px rgba(236, 72, 153, 0.4), 0 0 60px rgba(251, 146, 60, 0.2)',
        hover: '0 0 60px rgba(236, 72, 153, 0.9), 0 0 120px rgba(251, 146, 60, 0.6)'
      },
      [FEATURES_IDS.PACING_RHYTHM]: {
        selected: '0 0 50px rgba(168, 85, 247, 0.8), 0 0 100px rgba(236, 72, 153, 0.5)',  // Purple-Pink glow
        unselected: '0 0 30px rgba(168, 85, 247, 0.4), 0 0 60px rgba(236, 72, 153, 0.2)',
        hover: '0 0 60px rgba(168, 85, 247, 0.9), 0 0 120px rgba(236, 72, 153, 0.6)'
      },
      [FEATURES_IDS.AUDIO]: {
        selected: '0 0 50px rgba(59, 130, 246, 0.8), 0 0 100px rgba(6, 182, 212, 0.5)',  // Blue-Cyan glow
        unselected: '0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(6, 182, 212, 0.2)',
        hover: '0 0 60px rgba(59, 130, 246, 0.9), 0 0 120px rgba(6, 182, 212, 0.6)'
      },
      [FEATURES_IDS.VIEWS]: {
        selected: '0 0 50px rgba(34, 197, 94, 0.8), 0 0 100px rgba(16, 185, 129, 0.5)',  // Green-Emerald glow
        unselected: '0 0 30px rgba(34, 197, 94, 0.4), 0 0 60px rgba(16, 185, 129, 0.2)',
        hover: '0 0 60px rgba(34, 197, 94, 0.9), 0 0 120px rgba(16, 185, 129, 0.6)'
      },
      [FEATURES_IDS.ADVANCED_ANALYTICS]: {
        selected: '0 0 50px rgba(251, 146, 60, 0.8), 0 0 100px rgba(234, 179, 8, 0.5)',  // Orange-Yellow glow
        unselected: '0 0 30px rgba(251, 146, 60, 0.4), 0 0 60px rgba(234, 179, 8, 0.2)',
        hover: '0 0 60px rgba(251, 146, 60, 0.9), 0 0 120px rgba(234, 179, 8, 0.6)'
      },
      [FEATURES_IDS.CAPTION]: {
        selected: '0 0 50px rgba(99, 102, 241, 0.8), 0 0 100px rgba(168, 85, 247, 0.5)',  // Indigo-Purple glow
        unselected: '0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(168, 85, 247, 0.2)',
        hover: '0 0 60px rgba(99, 102, 241, 0.9), 0 0 120px rgba(168, 85, 247, 0.6)'
      }
    };

    const colors = glowColors[featureId] || glowColors[FEATURES_IDS.HOOK];
    
    if (isHovered) {
      return colors.hover;
    }
    
    return isSelected ? colors.selected : colors.unselected;
  };

  // Get checkmark glow color matching card gradient
  const getCheckmarkGlowColor = (featureId: string) => {
    const glowMap: Record<string, string> = {
      [FEATURES_IDS.HOOK]: 'rgba(236, 72, 153, 0.6)',
      [FEATURES_IDS.PACING_RHYTHM]: 'rgba(168, 85, 247, 0.6)',
      [FEATURES_IDS.AUDIO]: 'rgba(59, 130, 246, 0.6)',
      [FEATURES_IDS.VIEWS]: 'rgba(34, 197, 94, 0.6)',
      [FEATURES_IDS.ADVANCED_ANALYTICS]: 'rgba(251, 146, 60, 0.6)',
      [FEATURES_IDS.CAPTION]: 'rgba(99, 102, 241, 0.6)'
    };
    return glowMap[featureId] || 'rgba(34, 197, 94, 0.6)';
  };

  return (
    <div 
      className="w-full flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Carousel Container - Reduced height to fit viewport */}
      <div 
        className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] flex items-center justify-center"
        style={{ perspective: '1500px' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Navigation Arrows with Orange Glow - Always Visible */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-40
              w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-900/80 backdrop-blur-md
              border-2 border-orange-500/50 flex items-center justify-center
              hover:bg-gray-800 hover:scale-110 hover:border-orange-500
              transition-all duration-300 opacity-100"
            style={{
              boxShadow: '0 0 25px rgba(249, 115, 22, 0.5), 0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            aria-label="Previous feature"
          >
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" strokeWidth={2.5} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-40
              w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-900/80 backdrop-blur-md
              border-2 border-orange-500/50 flex items-center justify-center
              hover:bg-gray-800 hover:scale-110 hover:border-orange-500
              transition-all duration-300 opacity-100"
            style={{
              boxShadow: '0 0 25px rgba(249, 115, 22, 0.5), 0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
            aria-label="Next feature"
          >
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" strokeWidth={2.5} />
          </button>

          {/* Feature Cards - Using memoized poses for stability */}
          {cardPoses.map(({ index, pose }) => {
            const feature = features[index];
            const isSelected = selectedFeatureIds.includes(feature.id);
            const isCenter = pose.x === 0 && pose.z === 0;
            const isHovered = hoveredCard === index;
            const isVisible = Math.abs(pose.x) <= 400; // Only show cards within ±2 range
            
            // Hover brightness adjustment (visual only, no transform changes)
            const hoverBrightness = isHovered ? (isCenter ? 1.3 : 1.1) : pose.brightness;

            return (
              <motion.div
                key={feature.id}
                className={`absolute top-1/2 left-1/2
                  w-[240px] h-[360px] sm:w-[280px] sm:h-[420px] md:w-[320px] md:h-[480px]
                  rounded-3xl 
                  bg-gradient-to-br ${feature.color}
                  backdrop-blur-xl bg-opacity-10
                  shadow-2xl
                  cursor-pointer
                  overflow-hidden
                  transition-all duration-300
                  ${isSelected
                    ? 'border-[3px] border-green-500'
                    : 'border-2 border-white/20'
                  }`}
                style={{
                  transform: getTransformString(pose), // Stable transform, never changes on hover
                  opacity: isVisible ? pose.opacity : 0,
                  filter: `brightness(${hoverBrightness})`, // Only brightness changes on hover
                  transformStyle: 'preserve-3d',
                  zIndex: pose.zIndex, // Stable z-index
                  pointerEvents: isVisible ? 'auto' : 'none',
                  boxShadow: getCardGlowColor(feature.id, isSelected, isHovered) // Glow changes on hover
                }}
                initial={false}
                animate={{
                  transform: getTransformString(pose), // Explicitly animate transform for stability
                  opacity: isVisible ? pose.opacity : 0,
                  filter: `brightness(${hoverBrightness})`,
                  boxShadow: isSelected ? [
                    getCardGlowColor(feature.id, true, false),
                    getCardGlowColor(feature.id, true, true),
                    getCardGlowColor(feature.id, true, false)
                  ] : getCardGlowColor(feature.id, isSelected, isHovered)
                }}
                onClick={() => {
                  if (isCenter) {
                    toggleFeature(feature.id);
                  } else {
                    jumpToCard(index);
                  }
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 30,
                  duration: 0.7,
                  filter: { duration: 0.2 }, // Fast brightness transition
                  boxShadow: {
                    duration: isSelected ? 2 : 0.2,
                    repeat: isSelected ? Infinity : 0,
                    ease: 'easeInOut'
                  }
                }}
              >
                {/* Icon Container with Glow - Fixed sizing to prevent overlap */}
                <div className="absolute top-8 sm:top-10 md:top-12 left-1/2 -translate-x-1/2 z-10">
                  <div className={`${pose.circleSize} rounded-full backdrop-blur-md
                    flex items-center justify-center border-2 overflow-hidden
                    transition-all duration-500 p-2
                    ${isSelected
                      ? 'bg-orange-500/30 border-orange-400'
                      : 'bg-orange-500/20 border-orange-400/50'
                    }`}
                    style={{
                      boxShadow: isSelected
                        ? '0 0 25px rgba(249, 115, 22, 0.5)'
                        : '0 0 20px rgba(249, 115, 22, 0.3)'
                    }}
                  >
                    <feature.icon 
                      className={`${pose.iconSize} transition-colors flex-shrink-0
                        ${isSelected ? 'text-orange-200' : 'text-orange-300'
                      }`} 
                      strokeWidth={2} 
                    />
                  </div>
                </div>

                {/* Dark overlay for text readability */}
                <div className="absolute bottom-0 left-0 right-0 h-[65%] 
                  bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-b-3xl z-5" />

                {/* Title */}
                <h3 className="absolute top-24 sm:top-28 md:top-32 left-0 right-0 text-center text-lg sm:text-xl md:text-2xl font-bold text-white px-4 sm:px-8 z-10 drop-shadow-lg">
                  {feature.title}
                </h3>

                {/* Description - scrollable area for longer text */}
                <div className="absolute top-36 sm:top-40 md:top-44 left-0 right-0 bottom-4 sm:bottom-6 px-4 sm:px-6 md:px-8 overflow-y-auto z-10">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isCenter ? 1 : 0.7 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-white/95 text-xs sm:text-sm leading-relaxed drop-shadow-lg"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {feature.subtitle}
                  </motion.p>
                </div>

                {/* Enhanced Checkmark overlay with matching glow */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                      bg-green-500 rounded-full flex items-center justify-center
                      shadow-lg z-20 ring-4 ring-green-400/30"
                    style={{
                      boxShadow: `0 0 30px ${getCheckmarkGlowColor(feature.id)}, 0 4px 20px rgba(0, 0, 0, 0.5)`
                    }}
                  >
                    <Check className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" strokeWidth={4} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Progress Dots */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-30">
          {features.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => jumpToCard(index)}
                className={`rounded-full transition-all duration-300 cursor-pointer
                  ${isActive 
                    ? 'w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 ring-4 ring-orange-500/40' 
                    : 'w-3 h-3 sm:w-4 sm:h-4 bg-gray-600 hover:bg-gray-500'
                  }`}
                style={{
                  boxShadow: isActive
                    ? '0 0 20px rgba(249, 115, 22, 0.8)'
                    : '0 0 10px rgba(107, 114, 128, 0.3)'
                }}
                aria-label={`Go to feature ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FeatureCarousel;
