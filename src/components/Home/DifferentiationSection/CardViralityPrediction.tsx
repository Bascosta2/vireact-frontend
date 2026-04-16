import { TrendingUp } from 'lucide-react';
import FeatureCardWrapper from './FeatureCardWrapper';
import ViralityRangeWidget from './ViralityRangeWidget';

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
        </div>

        <div className="hidden md:flex flex-grow min-h-0 flex-col justify-center">
          <ViralityRangeWidget />
        </div>

        <div className="flex-shrink-0">
          <p className="text-sm text-zinc-400 leading-relaxed text-left w-full mb-3" style={{ lineHeight: 1.5 }}>
            AI benchmarks your content against 15M+ similar videos to predict your view range before you post. Our model is trained on short form videos across TikTok, Reels, and Shorts. You get a confidence scored range of conservative, expected, and optimistic before you hit post.
          </p>
        </div>

        <div className="flex-shrink-0 mt-auto" />
      </div>
    </FeatureCardWrapper>
  );
}

export default CardViralityPrediction;
