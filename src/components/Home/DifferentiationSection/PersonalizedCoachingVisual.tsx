import DNAHelix from './DNAHelix';

export const CONTENT_DNA_ROWS = [
  { label: 'Vibrant Colors', pct: 92 },
  { label: 'Voice Clarity', pct: 89 },
  { label: 'Fast Cuts', pct: 85 },
] as const;

export type PersonalizedCoachingVisualProps = {
  isHovered?: boolean;
  /** Applied to helix wrapper (e.g. 0.6 in card, smaller in hero preview). */
  helixScale?: number;
  className?: string;
  /** Mobile hero preview strip: helix + centered caption only (cards keep DNA + bars). */
  helixWithCoachingCaptionOnly?: boolean;
};

function PersonalizedCoachingVisual({
  isHovered = false,
  helixScale = 0.6,
  className = '',
  helixWithCoachingCaptionOnly = false,
}: PersonalizedCoachingVisualProps) {
  /** Hero mobile preview: fixed portrait slot; DNAHelix is 120×200 — scale to fit width 80 without stretching SVG. */
  const helixPreviewViewportW = 80;
  const helixPreviewViewportH = 140;
  const helixIntrinsicW = 120;
  const helixIntrinsicH = 200;
  const helixPreviewUniformScale = helixPreviewViewportW / helixIntrinsicW;

  return (
    <div className={className}>
      {helixWithCoachingCaptionOnly ? (
        <div
          className="mx-auto mb-1 flex shrink-0 items-center justify-center overflow-visible"
          style={{
            width: helixPreviewViewportW,
            height: helixPreviewViewportH,
          }}
        >
          <div
            className="shrink-0 overflow-visible"
            style={{
              width: helixIntrinsicW,
              height: helixIntrinsicH,
              transform: `scale(${helixPreviewUniformScale})`,
              transformOrigin: 'center center',
            }}
          >
            <DNAHelix isHovered={isHovered} />
          </div>
        </div>
      ) : (
        <div className="mx-auto mb-3 flex w-full max-h-24 flex-shrink-0 justify-center overflow-hidden">
          <div style={{ transform: `scale(${helixScale})`, transformOrigin: 'center center' }}>
            <DNAHelix isHovered={isHovered} />
          </div>
        </div>
      )}
      {helixWithCoachingCaptionOnly ? (
        <p className="w-full text-center text-[10px] font-normal text-zinc-400 leading-snug">
          Personalized Coaching
        </p>
      ) : (
        <>
          <p className="text-[10px] tracking-widest uppercase text-zinc-500 mb-2 w-full text-left">YOUR CONTENT DNA</p>
          <div className="space-y-2 mb-3 w-full">
            {CONTENT_DNA_ROWS.map((row, i) => (
              <div key={i} className="flex justify-between items-center gap-2">
                <span className="text-[10px] text-zinc-400">{row.label}</span>
                <div className="flex items-center gap-2 flex-1 max-w-[120px] justify-end">
                  <div className="flex-1 h-[3px] rounded-full bg-white/[0.06] overflow-hidden max-w-[70px]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.pct}%`,
                        background: 'linear-gradient(to right, #FF3CAC, #FF8C00)',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 w-8 text-right tabular-nums">{row.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default PersonalizedCoachingVisual;
