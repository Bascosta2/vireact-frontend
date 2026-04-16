import { Brain, Target, Clock, Users } from 'lucide-react';
import FeatureCardWrapper from './FeatureCardWrapper';
import PersonalizedCoachingVisual from './PersonalizedCoachingVisual';

function CardPersonalizedCoaching({
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
      accent="blue"
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label="Personalized Coaching feature card"
    >
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 flex-shrink-0 bg-blue-500">
            <Brain className="w-5 h-5 text-white" aria-hidden />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            Personalized Coaching
          </h3>
        </div>

        <div className="hidden md:flex flex-grow min-h-0 flex-col justify-center">
          <PersonalizedCoachingVisual isHovered={isFocused} helixScale={0.6} />
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 w-full text-left">PERSONALIZED INSIGHTS</p>
          <ul className="space-y-1.5 mb-6 w-full text-left text-[11px] text-zinc-400" style={{ lineHeight: 1.4 }}>
            <li className="flex items-start gap-2">
              <Target className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden />
              <span>Fast cuts (0.8–1.2s) work 3.2x better for you</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden />
              <span>You excel at 2.8s cut frequency</span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden />
              <span>Your audience responds best to &lt;1s opening shots</span>
            </li>
          </ul>
        </div>

        <div className="flex-shrink-0">
          <p className="text-sm text-zinc-400 leading-relaxed text-left w-full mb-3" style={{ lineHeight: 1.5 }}>
            AI learns your unique content patterns across all your videos and surfaces personalized insights that protect your creative voice. The more videos you analyze, the smarter it gets about your style. It identifies what makes your content perform and tells you exactly how to double down on it.
          </p>
        </div>

        <div className="flex-shrink-0 mt-auto" />
      </div>
    </FeatureCardWrapper>
  );
}

export default CardPersonalizedCoaching;
