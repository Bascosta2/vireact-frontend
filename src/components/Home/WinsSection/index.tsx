import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import CustomMarquee from '@/components/UI/Marquee';
import WinsCard from './WinsCard';
import { winsData } from './wins-data';

const MOBILE_WINS_DUP = [...winsData, ...winsData];

function WinsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });
  const [mounted, setMounted] = useState(false);
  const testimonialScrollRef = useRef<HTMLDivElement>(null);
  const isPausedTestimonial = useRef(false);

  const testimonialTouchHandlers = {
    onTouchStart: () => {
      isPausedTestimonial.current = true;
    },
    onTouchEnd: () => {
      isPausedTestimonial.current = false;
    },
    onTouchCancel: () => {
      isPausedTestimonial.current = false;
    },
  } as const;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = testimonialScrollRef.current;
    if (!el) return;
    const setMid = () => {
      if (el.scrollWidth > el.clientWidth) {
        el.scrollLeft = el.scrollWidth / 2;
      }
    };
    setMid();
    requestAnimationFrame(setMid);
    const id = window.setInterval(() => {
      if (isPausedTestimonial.current) return;
      if (el.scrollWidth <= el.clientWidth) return;
      el.scrollLeft -= 1;
      if (el.scrollLeft <= 0) {
        el.scrollLeft = el.scrollWidth / 2;
      }
    }, 20);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div id="creator-stories" ref={ref} className="w-full py-12 md:py-24 overflow-x-hidden">
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
          className="md:hidden w-full"
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <div
            ref={testimonialScrollRef}
            {...testimonialTouchHandlers}
            className="overflow-x-auto scrollbar-hide flex flex-row gap-4 px-4 pb-2"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {MOBILE_WINS_DUP.map((w, i) => (
              <article
                key={`${w.name}-${i}`}
                className="shrink-0 w-[280px] rounded-2xl bg-gray-900 p-4 flex flex-col gap-2 border border-white/[0.08]"
                aria-label={`Testimonial from ${w.name}`}
              >
                <div className="flex items-center gap-2">
                  <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                    <img src={w.avatarSrc} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{w.name}</p>
                    <p className="text-xs text-gray-400 truncate">{w.platform}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-snug line-clamp-2">{w.niche}</p>
                <p
                  className="text-sm font-bold shrink-0"
                  style={{
                    background: 'linear-gradient(90deg, #FF3CAC, #FF8C00)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {w.stat}
                </p>
                <p className="text-sm text-gray-300 italic leading-relaxed line-clamp-4">
                  &ldquo;{w.quote}&rdquo;
                </p>
              </article>
            ))}
          </div>
          <p className="text-center text-sm text-zinc-500 pt-3 px-4">and more…</p>
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
