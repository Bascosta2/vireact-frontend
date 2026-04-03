import { useState, useEffect, useRef } from 'react';
import { Scissors } from 'lucide-react';
import FeatureCardWrapper from './FeatureCardWrapper';

const ACTIONABLE_FIX_ROTATION = [
  '✂  Cut your intro from 4s → 1.5s for +31% retention',
  '🎵  Background music too loud at 0:07 — lower by 40%',
  '📌  Add caption at 0:03 — viewers drop off without text',
] as const;

function CardActionableEdits({
  isFocused,
  onFocus,
  onBlur,
}: {
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const [retentionValue, setRetentionValue] = useState(21);
  const [fixIndex, setFixIndex] = useState(0);
  const [fixOpacity, setFixOpacity] = useState(1);
  const fixTimeoutsRef = useRef<{ outer?: ReturnType<typeof setTimeout>; inner?: ReturnType<typeof setTimeout> }>({});

  useEffect(() => {
    let cancelled = false;

    const schedule = (idx: number) => {
      fixTimeoutsRef.current.outer = setTimeout(() => {
        if (cancelled) return;
        setFixOpacity(0);
        fixTimeoutsRef.current.inner = setTimeout(() => {
          if (cancelled) return;
          const next = (idx + 1) % ACTIONABLE_FIX_ROTATION.length;
          setFixIndex(next);
          setFixOpacity(1);
          schedule(next);
        }, 400);
      }, 2500);
    };

    schedule(0);
    return () => {
      cancelled = true;
      const { outer, inner } = fixTimeoutsRef.current;
      if (outer) clearTimeout(outer);
      if (inner) clearTimeout(inner);
    };
  }, []);

  const v = retentionValue;
  const retentionLabelColor =
    v <= 39 ? '#ef4444' : v <= 69 ? '#eab308' : '#22c55e';

  const viewsLow = Math.round(2 + (v / 100) ** 1.6 * 148);
  const viewsHigh = Math.round(5 + (v / 100) ** 1.4 * 235);
  const viralProb = Math.round(2 + (v / 100) ** 1.8 * 93);

  const badgeStyle =
    v <= 39
      ? { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' }
      : v <= 69
        ? { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.4)', text: '#eab308' }
        : { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#22c55e' };

  return (
    <FeatureCardWrapper
      isFocused={isFocused}
      accent="green"
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label="Actionable Edits feature card"
    >
      <div className="flex flex-col h-full card-actionable-edits">
        <div className="flex-shrink-0">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 flex-shrink-0 bg-emerald-500">
            <Scissors className="w-5 h-5 text-white" aria-hidden />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            Actionable Edits
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed text-left w-full mb-2" style={{ lineHeight: 1.5 }}>
            Frame by frame AI feedback with exact timestamps so you know precisely what to fix and why. Every suggestion includes a timestamp so you know exactly where to make the cut. No guesswork, just a clear action list ranked by impact.
          </p>
        </div>

        <div className="hidden md:flex flex-grow min-h-0 flex-col justify-center">
          <div className="relative w-full max-w-[260px] mx-auto mb-2">
            <p className="text-xs font-semibold tracking-widest text-orange-400/70 uppercase text-left mb-2">
              ⇔ DRAG TO SIMULATE YOUR RETENTION
            </p>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[10px] text-zinc-500">Retention Score</span>
              <span className="text-[10px] font-semibold tabular-nums" style={{ color: retentionLabelColor }}>
                +{retentionValue}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={retentionValue}
              onChange={(e) => setRetentionValue(Number(e.target.value))}
              className="retention-slider w-full"
              aria-label="Retention score"
            />
            <div
              className="mt-3 mb-3 min-h-[44px] rounded-lg bg-white/5 px-3 py-2 flex items-center transition-opacity duration-[400ms] ease-in-out"
              style={{ opacity: fixOpacity }}
              aria-live="polite"
            >
              <p className="text-xs text-zinc-300 leading-snug">{ACTIONABLE_FIX_ROTATION[fixIndex]}</p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 mt-auto max-md:mt-4">
          <div className="flex flex-wrap gap-2">
            <span
              className="text-[11px] px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border, color: badgeStyle.text }}
            >
              +{retentionValue}% Retention
            </span>
            <span
              className="text-[11px] px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border, color: badgeStyle.text }}
            >
              {viewsLow}K → {viewsHigh}K Views
            </span>
            <span
              className="text-[11px] px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border, color: badgeStyle.text }}
            >
              {viralProb}% Viral Prob.
            </span>
          </div>
        </div>
      </div>
    </FeatureCardWrapper>
  );
}

export default CardActionableEdits;
