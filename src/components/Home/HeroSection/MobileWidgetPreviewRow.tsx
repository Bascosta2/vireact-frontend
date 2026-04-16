import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PersonalizedCoachingVisual from '@/components/Home/DifferentiationSection/PersonalizedCoachingVisual';

/** Shared gradient labels — above widget; gap-3 between label and content. */
const previewGradientLabelClass =
  'w-full shrink-0 text-center font-bold bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent text-xs leading-tight';

/** Columns: fully visible content, no scroll, no clipping. */
const tileClass = 'relative flex flex-col items-center min-w-0 px-0.5 overflow-visible';

const FEEDBACK_ROTATION_MS = 2500;

/** Each set is exactly three lines (one bullet each). */
const FEEDBACK_SETS: readonly [string, string, string][] = [
  ['✂️ Cut intro from 4s → 1.5s', '🎵 Lower music at 0:07', '📝 Add caption at 0:03'],
  ['⚡ Front-load hook in first 1s', '🎯 Tighter framing at 0:12', '🔊 Normalize voice vs BGM'],
  ['📌 CTA clearer in outro', '✨ Speed up midsection ~8%', '🎬 Match cut on beat drop'],
  ['💡 Brighten key shot at 0:05', '📏 Trim dead air 0:18–0:22', '🗣️ Punch up cold open line'],
];

/** Same track + center gradient segment + thumb as original ViralityRangeWidget range bar. */
const VIEWS_RANGE_TRACK_CLASS = 'relative h-1.5 w-full rounded-full bg-white/[0.06]';
const VIEWS_RANGE_GRADIENT_STYLE = {
  background: 'linear-gradient(to right, rgba(255,60,172,0.6), rgba(255,140,0,0.6))',
} as const;
const VIEWS_RANGE_THUMB_SHADOW = { boxShadow: '0 0 10px rgba(255,140,0,0.9)' } as const;

/**
 * Hero-only virality preview: 110K centered above bar; 45K / 180K at bar ends; Low / High below.
 * (Mirrors widget values/layout; avoids editing ViralityRangeWidget.tsx per file scope.)
 */
function HeroViralityRangePreview() {
  return (
    <div className="mt-3 mb-0 w-full">
      <div className="mb-1.5 w-full text-center">
        <span className="text-xl font-bold text-white">110K</span>
      </div>
      <div className="flex w-full items-center gap-1.5">
        <span className="w-8 shrink-0 text-xs text-gray-400">45K</span>
        <div className="min-w-0 flex-1">
          <div className={VIEWS_RANGE_TRACK_CLASS}>
            <div
              className="absolute left-[25%] right-[25%] h-full rounded-full"
              style={VIEWS_RANGE_GRADIENT_STYLE}
            />
            <div
              className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/4 rounded-full bg-white"
              style={VIEWS_RANGE_THUMB_SHADOW}
            />
          </div>
          <div className="mt-1 flex w-full justify-between">
            <span className="text-xs text-gray-500">Low</span>
            <span className="text-xs text-gray-500">High</span>
          </div>
        </div>
        <span className="w-8 shrink-0 text-right text-xs text-gray-400">180K</span>
      </div>
    </div>
  );
}

/**
 * Decorative hero preview: rotating AI-style feedback bullets (no props).
 */
function FeedbackBubblePreview() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % FEEDBACK_SETS.length);
    }, FEEDBACK_ROTATION_MS);
    return () => window.clearInterval(id);
  }, []);

  const lines = FEEDBACK_SETS[index];

  return (
    <div className="pointer-events-none w-full max-w-[240px] select-none overflow-visible px-0.5">
      <div className="flex flex-row items-start gap-2 overflow-visible">
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-[12px] leading-none shadow-md"
          aria-hidden
        >
          ✨
        </div>
        <div className="min-h-[90px] min-w-0 flex-1 overflow-visible rounded-xl border border-white/10 bg-gray-800/95 px-2.5 py-2 shadow-lg">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-visible"
            >
              <ul className="flex flex-col gap-1.5 text-left text-xs leading-snug text-zinc-100">
                {lines.map((line, li) => (
                  <li key={li} className="block">
                    <span className="text-zinc-500">• </span>
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Uniform scale from top center. No fixed outer height — avoids layout vs. transform
 * mismatch that triggers overflow scrollbars in some browsers.
 */
function ScaledPreviewColumn({
  scale,
  children,
}: {
  scale: number;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full max-w-[260px] justify-center overflow-visible">
      <div
        className="flex w-full max-w-[260px] flex-col items-center overflow-visible pointer-events-none select-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function MobileWidgetPreviewRow() {
  return (
    <motion.div
      className="md:hidden overflow-visible px-0.5 mt-6 mb-0"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.28 }}
      aria-hidden
    >
      <div className="mx-auto grid w-full max-w-full grid-cols-3 items-start gap-1.5 overflow-visible">
        <div className={tileClass}>
          <div className="flex w-full max-w-[260px] flex-col items-center gap-3 overflow-visible">
            <p className={previewGradientLabelClass}>Receive Split Second Feedback</p>
            <ScaledPreviewColumn scale={0.76}>
              <FeedbackBubblePreview />
            </ScaledPreviewColumn>
          </div>
        </div>
        <div className={tileClass}>
          <div className="flex w-full max-w-[260px] flex-col items-center gap-3 overflow-visible">
            <p className={previewGradientLabelClass}>Predict Your Views</p>
            <ScaledPreviewColumn scale={0.92}>
              <HeroViralityRangePreview />
            </ScaledPreviewColumn>
          </div>
        </div>
        <div className={tileClass}>
          <div className="flex w-full max-w-[260px] flex-col items-center gap-3 overflow-visible">
            <p className={previewGradientLabelClass}>Personalized Coaching</p>
            <ScaledPreviewColumn scale={1}>
              <PersonalizedCoachingVisual
                isHovered={false}
                className="-mt-1 shrink-0 [&>p]:hidden"
                helixWithCoachingCaptionOnly
              />
            </ScaledPreviewColumn>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
