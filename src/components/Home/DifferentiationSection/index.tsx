import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CardActionableEdits from './CardActionableEdits';
import CardViralityPrediction from './CardViralityPrediction';
import CardPersonalizedCoaching from './CardPersonalizedCoaching';
import DifferentiationMobileCarousel from './DifferentiationMobileCarousel';

function useIsMdViewport() {
  const [isMd, setIsMd] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 768px)').matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => setIsMd(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return isMd;
}

function DifferentiationSection() {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const isMd = useIsMdViewport();

  const cardProps = (i: number) => ({
    isFocused: focusedIndex === i,
    onFocus: () => setFocusedIndex(i),
    onBlur: () => setFocusedIndex(null),
  });

  return (
    <section className="relative z-[11] w-full bg-transparent px-4 pt-0 pb-8 md:pb-24 -mt-6 md:-mt-[300px]" aria-label="Feature cards">
      <div className="max-w-7xl mx-auto">
        {isMd ? (
          <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-4 md:gap-6">
            <motion.div
              className="flex flex-1 min-w-0 h-full min-h-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
              onMouseEnter={() => setFocusedIndex(0)}
              onMouseLeave={() => setFocusedIndex(null)}
            >
              <CardActionableEdits {...cardProps(0)} />
            </motion.div>
            <motion.div
              className="flex flex-1 min-w-0 h-full min-h-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
              onMouseEnter={() => setFocusedIndex(1)}
              onMouseLeave={() => setFocusedIndex(null)}
            >
              <CardViralityPrediction {...cardProps(1)} />
            </motion.div>
            <motion.div
              className="flex flex-1 min-w-0 h-full min-h-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
              onMouseEnter={() => setFocusedIndex(2)}
              onMouseLeave={() => setFocusedIndex(null)}
            >
              <CardPersonalizedCoaching {...cardProps(2)} />
            </motion.div>
          </div>
        ) : (
          <DifferentiationMobileCarousel onActiveIndexChange={setFocusedIndex}>
            <CardActionableEdits {...cardProps(0)} />
            <CardViralityPrediction {...cardProps(1)} />
            <CardPersonalizedCoaching {...cardProps(2)} />
          </DifferentiationMobileCarousel>
        )}
      </div>
    </section>
  );
}

export default DifferentiationSection;
