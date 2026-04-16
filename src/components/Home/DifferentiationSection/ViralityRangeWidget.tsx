import { cn } from '@/lib/utils';

export const VIRALITY_SCENARIOS = [
  { label: 'Conservative', range: '45–65K', prob: '15%', color: 'text-yellow-400', bg: 'bg-yellow-500/8' },
  { label: 'Expected', range: '75–95K', prob: '89%', color: 'text-blue-400', bg: 'bg-blue-500/8' },
  { label: 'Optimistic', range: '150–180K', prob: '35%', color: 'text-green-400', bg: 'bg-green-500/8' },
] as const;

export type ViralityRangeWidgetProps = {
  className?: string;
  /** Mobile hero preview strip: hide scenario label + three scenario tiles (cards keep them). */
  hideScenarioBreakdown?: boolean;
  /** Mobile hero preview strip: hide grey confidence / meta line under the range bar (cards keep it). */
  hideConfidenceSummary?: boolean;
};

function ViralityRangeWidget({
  className = '',
  hideScenarioBreakdown = false,
  hideConfidenceSummary = false,
}: ViralityRangeWidgetProps) {
  return (
    <div className={cn('mt-3 mb-2', className)}>
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
      {!hideConfidenceSummary ? (
        <p className="text-[10px] text-zinc-500">
          89% Confidence · 15.2M similar videos · Top 12% in niche
        </p>
      ) : null}
      {!hideScenarioBreakdown ? (
        <>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-3 mb-2 w-full text-left">
            Scenario breakdown
          </p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {VIRALITY_SCENARIOS.map((s, i) => (
              <div key={i} className={`${s.bg} rounded-lg p-2 text-center border border-white/[0.05]`}>
                <div className={`text-xs font-bold ${s.color}`}>{s.prob}</div>
                <div className="text-[9px] text-zinc-400 mt-0.5 leading-tight">{s.range}</div>
                <div className="text-[9px] text-zinc-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default ViralityRangeWidget;
