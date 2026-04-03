import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import CustomMarquee from '@/components/UI/Marquee';
import NicheCard from '@/components/FeaturesPage/Niches/NicheCard';
import { nicheData } from '@/components/FeaturesPage/Niches/niche-data';

function ViralPredictionsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15, once: true });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div ref={ref} className="w-full py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <motion.h2
          className="text-center text-3xl md:text-4xl lg:text-[52px] font-bold mb-12 md:mb-20"
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
