import { useState } from 'react';
import { Scissors } from 'lucide-react';
import FeatureCardWrapper from './FeatureCardWrapper';
import RetentionSliderWidget from './RetentionSliderWidget';

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

  const v = retentionValue;
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
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 flex-shrink-0 bg-emerald-500">
            <Scissors className="w-5 h-5 text-white" aria-hidden />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            Actionable Edits
          </h3>
        </div>

        <div className="hidden md:flex flex-grow min-h-0 flex-col justify-center">
          <RetentionSliderWidget value={retentionValue} onValueChange={setRetentionValue} />
        </div>

        <div className="hidden md:block flex-shrink-0 md:mt-0 md:-mt-1 mb-6">
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

        <div className="flex-shrink-0">
          <p className="text-sm text-zinc-400 leading-relaxed text-left w-full mb-2" style={{ lineHeight: 1.5 }}>
            Frame by frame AI feedback with exact timestamps so you know precisely what to fix and why. Every suggestion includes a timestamp so you know exactly where to make the cut. No guesswork, just a clear action list ranked by impact.
          </p>
        </div>
      </div>
    </FeatureCardWrapper>
  );
}

export default CardActionableEdits;
