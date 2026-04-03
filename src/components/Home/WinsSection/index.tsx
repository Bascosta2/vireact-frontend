import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import CustomMarquee from '@/components/UI/Marquee';
import WinsCard from './WinsCard';
import { winsData } from './wins-data';

const MOBILE_WIN_ORDER = ['Wealth Growth Lab', 'The Junktion'] as const;

function WinsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const mobileWins = MOBILE_WIN_ORDER.map((n) => winsData.find((w) => w.name === n)).filter(
    (w): w is (typeof winsData)[number] => Boolean(w),
  );

  return (
    <div id="creator-stories" ref={ref} className="w-full py-8 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-20">
        <motion.div
          className="flex justify-center mb-6 md:mb-12"
          initial={mounted ? { scale: 0.9, opacity: 0 } : false}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <span
            className="inline-flex items-center rounded-full text-[11px] md:text-[15px] px-4 py-2 md:px-7 md:py-3 tracking-[0.1em] md:tracking-[0.12em] font-semibold"
            style={{
              borderRadius: '999px',
              border: '1px solid rgba(74, 222, 128, 0.45)',
              background: 'rgba(74, 222, 128, 0.08)',
              color: '#4ade80',
            }}
          >
            WHAT OUR USERS ACHIEVED
          </span>
        </motion.div>

        <motion.div
          className="md:hidden flex flex-col gap-4"
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          {mobileWins.map((w) => (
            <WinsCard
              key={w.name}
              variant="mobile"
              initials={w.initials}
              name={w.name}
              platform={w.platform}
              niche={w.niche}
              stat={w.stat}
              context={w.context}
              quote={w.quote}
              avatarSrc={w.avatarSrc}
            />
          ))}
          <p className="text-center text-sm text-zinc-500 pt-1">and more…</p>
        </motion.div>

        <motion.div
          className="relative hidden md:block"
          initial={mounted ? { opacity: 0, y: 30 } : false}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          <CustomMarquee
            speed={25}
            direction="left"
            pauseOnHover
            gradient={false}
            className="py-4"
          >
            {winsData.map((w) => (
              <WinsCard
                key={w.name}
                variant="marquee"
                initials={w.initials}
                name={w.name}
                platform={w.platform}
                niche={w.niche}
                stat={w.stat}
                context={w.context}
                quote={w.quote}
                avatarSrc={w.avatarSrc}
              />
            ))}
          </CustomMarquee>
        </motion.div>
      </div>
    </div>
  );
}

export default WinsSection;
