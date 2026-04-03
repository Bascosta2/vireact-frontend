import { TrendingUp } from 'lucide-react';
import FeatureCardWrapper from './FeatureCardWrapper';

const SCENARIOS = [
  { label: 'Conservative', range: '45–65K', prob: '15%', color: 'text-yellow-400', bg: 'bg-yellow-500/8' },
  { label: 'Expected', range: '75–95K', prob: '89%', color: 'text-blue-400', bg: 'bg-blue-500/8' },
  { label: 'Optimistic', range: '150–180K', prob: '35%', color: 'text-green-400', bg: 'bg-green-500/8' },
];

function CardViralityPrediction({
  isFocused,
  onFocus,
  onBlur,
}: {
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <FeatureCardWrapper
      isFocused={isFocused}
      accent="pink"
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label="Virality Prediction feature card"
    >
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 flex-shrink-0 bg-pink-500">
            <TrendingUp className="w-5 h-5 text-white" aria-hidden />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            Virality Prediction
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed text-left w-full mb-3" style={{ lineHeight: 1.5 }}>
            AI benchmarks your content against 15M+ similar videos to predict your view range before you post. Our model is trained on short form videos across TikTok, Reels, and Shorts. You get a confidence scored range of conservative, expected, and optimistic before you hit post.
          </p>
        </div>

        <div className="hidden md:flex flex-grow min-h-0 flex-col justify-center">
          <div className="mt-3 mb-2">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] text-zinc-600">45K</span>
              <div className="text-center">
                <span className="text-xl font-bold text-white">110K</span>
                <span className="text-[10px] text-zinc-400 ml-1">expected</span>
              </div>
              <span className="text-[10px] text-zinc-600">180K</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-white/[0.06]">
              <div
                className="absolute left-[25%] right-[25%] h-full rounded-full"
                style={{ background: 'linear-gradient(to right, rgba(255,60,172,0.6), rgba(255,140,0,0.6))' }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/4 w-3 h-3 rounded-full bg-white"
                style={{ boxShadow: '0 0 10px rgba(255,140,0,0.9)' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-zinc-700">Low</span>
              <span className="text-[9px] text-zinc-700">High</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500">
            89% Confidence · 15.2M similar videos · Top 12% in niche
          </p>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-3 mb-2 w-full text-left">
            Scenario breakdown
          </p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {SCENARIOS.map((s, i) => (
              <div
                key={i}
                className={`${s.bg} rounded-lg p-2 text-center border border-white/[0.05]`}
              >
                <div className={`text-xs font-bold ${s.color}`}>{s.prob}</div>
                <div className="text-[9px] text-zinc-400 mt-0.5 leading-tight">{s.range}</div>
                <div className="text-[9px] text-zinc-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 mt-auto" />
      </div>
    </FeatureCardWrapper>
  );
}

export default CardViralityPrediction;
