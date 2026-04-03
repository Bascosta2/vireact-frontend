import { Sparkles } from 'lucide-react';

function HeroVisualProof() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-10 px-4">
      {/* Video thumbnail placeholder */}
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-xl overflow-hidden border-2 border-white/20 bg-gray-900/80 shadow-xl">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <span className="text-gray-500 text-sm font-medium">Your video</span>
        </div>
      </div>

      {/* AI feedback snippet overlay */}
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] rounded-xl border border-emerald-500/40 bg-gray-900/90 backdrop-blur-sm p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-400" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">AI feedback</span>
        </div>
        <ul className="space-y-2 text-sm text-gray-200">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Cut at 0:03 — hook drags</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Add text overlay at 0:12</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Virality potential: 87% → 92% with edits</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default HeroVisualProof;
