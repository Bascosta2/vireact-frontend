import { useState } from 'react';
import { motion } from 'framer-motion';
import CardActionableEdits from './CardActionableEdits';
import CardViralityPrediction from './CardViralityPrediction';
import CardPersonalizedCoaching from './CardPersonalizedCoaching';

function DifferentiationSection() {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  return (
    <section className="relative z-[11] w-full bg-transparent px-4 pt-0 pb-8 md:pb-24 -mt-6 md:-mt-[300px]" aria-label="Feature cards">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-4 md:gap-6">
          <motion.div
            className="flex flex-1 min-w-0 h-full min-h-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            onMouseEnter={() => setFocusedIndex(0)}
            onMouseLeave={() => setFocusedIndex(null)}
          >
            <CardActionableEdits
              isFocused={focusedIndex === 0}
              onFocus={() => setFocusedIndex(0)}
              onBlur={() => setFocusedIndex(null)}
            />
          </motion.div>
          <motion.div
            className="flex flex-1 min-w-0 h-full min-h-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
            onMouseEnter={() => setFocusedIndex(1)}
            onMouseLeave={() => setFocusedIndex(null)}
          >
            <CardViralityPrediction
              isFocused={focusedIndex === 1}
              onFocus={() => setFocusedIndex(1)}
              onBlur={() => setFocusedIndex(null)}
            />
          </motion.div>
          <motion.div
            className="flex flex-1 min-w-0 h-full min-h-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
            onMouseEnter={() => setFocusedIndex(2)}
            onMouseLeave={() => setFocusedIndex(null)}
          >
            <CardPersonalizedCoaching
              isFocused={focusedIndex === 2}
              onFocus={() => setFocusedIndex(2)}
              onBlur={() => setFocusedIndex(null)}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default DifferentiationSection;
