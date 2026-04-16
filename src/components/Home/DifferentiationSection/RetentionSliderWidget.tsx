import { useState, useEffect, useRef } from 'react';

const ACTIONABLE_FIX_ROTATION = [
  '✂  Cut your intro from 4s → 1.5s for +31% retention',
  '🎵  Background music too loud at 0:07 — lower by 40%',
  '📌  Add caption at 0:03 — viewers drop off without text',
] as const;

export type RetentionSliderWidgetProps = {
  className?: string;
  /** Controlled value 0–100 (feature card). */
  value?: number;
  onValueChange?: (value: number) => void;
  /** Hero preview: animates the thumb, non-interactive. */
  previewAutoPlay?: boolean;
  /** Mobile hero preview strip: hide orange drag instruction (cards keep it). */
  hideDragInstruction?: boolean;
};

function RetentionSliderWidget({
  className = '',
  value: controlledValue,
  onValueChange,
  previewAutoPlay = false,
  hideDragInstruction = false,
}: RetentionSliderWidgetProps) {
  const [internalValue, setInternalValue] = useState(21);
  const controlled = controlledValue !== undefined;
  const retentionValue = controlled ? controlledValue : internalValue;

  const [fixIndex, setFixIndex] = useState(0);
  const [fixOpacity, setFixOpacity] = useState(1);
  const fixTimeoutsRef = useRef<{ outer?: ReturnType<typeof setTimeout>; inner?: ReturnType<typeof setTimeout> }>({});

  useEffect(() => {
    if (previewAutoPlay && !controlled) {
      let raf = 0;
      const t0 = performance.now();
      const durationMs = 4500;
      const tick = (now: number) => {
        const t = ((now - t0) % durationMs) / durationMs;
        const v = Math.round(18 + 62 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2)));
        setInternalValue(v);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
  }, [previewAutoPlay, controlled]);

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
  const retentionLabelColor = v <= 39 ? '#ef4444' : v <= 69 ? '#eab308' : '#22c55e';

  const setValue = (next: number) => {
    if (previewAutoPlay) return;
    if (controlled) onValueChange?.(next);
    else setInternalValue(next);
  };

  return (
    <div className={`retention-slider-scope relative w-full max-w-[260px] mx-auto mb-0 ${className}`}>
      {!hideDragInstruction ? (
        <p className="text-xs font-semibold tracking-widest text-orange-400/70 uppercase text-left mb-2">
          ⇔ DRAG TO SIMULATE YOUR RETENTION
        </p>
      ) : null}
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
        onChange={(e) => setValue(Number(e.target.value))}
        className={`retention-slider w-full ${previewAutoPlay ? 'pointer-events-none' : ''}`}
        aria-label="Retention score"
      />
      <div
        className="mt-3 mb-2 min-h-[44px] rounded-lg bg-white/5 px-3 py-2 flex items-center transition-opacity duration-[400ms] ease-in-out"
        style={{ opacity: fixOpacity }}
        aria-live="polite"
      >
        <p className="text-xs text-zinc-300 leading-snug">{ACTIONABLE_FIX_ROTATION[fixIndex]}</p>
      </div>
    </div>
  );
}

export default RetentionSliderWidget;
