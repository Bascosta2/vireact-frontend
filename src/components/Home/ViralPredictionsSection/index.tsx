import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import CustomMarquee from '@/components/UI/Marquee';
import NicheCard from '@/components/FeaturesPage/Niches/NicheCard';
import { nicheData } from '@/components/FeaturesPage/Niches/niche-data';
import { useMobileHorizontalAutoScroll } from '@/hooks/useMobileHorizontalAutoScroll';

function ViralPredictionsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15, once: true });
  const [mounted, setMounted] = useState(false);
  const thumbsScroll = useMobileHorizontalAutoScroll();

  useEffect(() => setMounted(true), []);

  return (
    <div ref={ref} className="w-full py-12 md:py-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-20">
        <motion.h2
          className="text-center text-2xl md:text-4xl lg:text-[52px] font-bold mb-8 md:mb-20 px-2 md:px-0 leading-tight"
          style={{
            background: 'linear-gradient(90deg, #ffffff, #FF1493, #FF6B35)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          FROM IDEA TO VIRAL, INSTANT PREDICTIONS MADE EASY
        </motion.h2>

        <motion.div
          className="md:hidden mb-2"
          initial={mounted ? { opacity: 0, y: 16 } : false}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div
            ref={thumbsScroll.scrollRef}
            {...thumbsScroll.touchHandlers}
            className="overflow-x-auto scrollbar-hide flex flex-row gap-4 px-4 pb-2"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {nicheData.map((niche) => (
              <div
                key={niche.id}
                className="relative shrink-0 w-[160px] rounded-xl overflow-hidden bg-white/10 border border-white/20"
              >
                <span className="absolute left-2 top-2 z-10 inline-block max-w-[calc(100%-1rem)] truncate text-[10px] font-medium rounded-full px-2 py-1 bg-black/60 text-white border border-white/20">
                  {niche.isFounder ? 'Founder (1.1M+ @YouTube)' : niche.category}
                </span>
                <div className="aspect-[160/284] w-full">
                  <img
                    src={niche.thumbnail}
                    alt={niche.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="hidden md:block"
          initial={mounted ? { opacity: 0, x: 50 } : false}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CustomMarquee
            speed={35}
            direction="right"
            pauseOnHover={false}
            gradient={false}
            className="py-4"
          >
            {nicheData.map((niche) => (
              <NicheCard
                key={niche.id}
                category={niche.category}
                alt={niche.alt}
                thumbnail={niche.thumbnail}
                isFounder={niche.isFounder}
                interactive={false}
              />
            ))}
          </CustomMarquee>
        </motion.div>
      </div>
    </div>
  );
}

export default ViralPredictionsSection;
