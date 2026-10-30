import { ListChecks, Wand2, Sparkles, Clock3, Target } from 'lucide-react';
import { AssetSlot } from '@/components/marketing/AssetSlot';
import { PrimaryCta } from './PrimaryCta';
import { demoFeedback } from '@/content/demoFeedback';
import { Highlight } from './Highlight';
import { claims } from '@/content/claims';
import { assetExists } from '@/content/assets.manifest';

const Bullet = ({ icon: Icon, children }: { icon: typeof ListChecks; children: React.ReactNode }) => (
  <li className="flex items-start gap-3 text-sm text-zinc-200">
    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-300">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </span>
    <span>{children}</span>
  </li>
);

const PhaseCard = ({
  step,
  title,
  bullets,
  visual,
}: {
  step: string;
  title: React.ReactNode;
  bullets: React.ReactNode;
  visual: React.ReactNode;
}) => (
  <div
    className={`grid gap-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-6 shadow-sm shadow-black/40 ${
      visual ? 'md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]' : ''
    }`}
  >
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Step {step}</p>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <ul className="mt-2 space-y-2">{bullets}</ul>
    </div>
    {visual && <div className="md:pl-4">{visual}</div>}
  </div>
);

const ScriptDiffDemo = () => (
  <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-50">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
      Frame-by-frame fix example
    </p>
    <ul className="space-y-3">
      {demoFeedback.map((item, idx) => (
        <li key={idx} className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-300">
            {item.timestampStart.toFixed(0)}s–{item.timestampEnd.toFixed(0)}s · {item.type ?? 'note'}
          </div>
          {item.before && (
            <div className="rounded-md bg-zinc-900/80 px-2 py-1.5 text-[13px] text-zinc-200 line-through">
              {item.before}
            </div>
          )}
          <div className="rounded-md bg-emerald-500/15 px-2 py-1.5 text-[13px] text-emerald-50">
            {item.after}
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export function HowItWorksPhases() {
  // Placeholders stay visible in dev so missing assets are obvious; production hides the empty visual.
  const hasBeforeAfter =
    !import.meta.env.PROD || (assetExists('before-after-before') && assetExists('before-after-after'));
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <header className="mb-8 max-w-2xl space-y-3 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">
          3 steps to your next viral video
        </p>
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Turn <Highlight>one upload</Highlight> into a repeatable process.
        </h2>
        <p className="text-sm text-zinc-300">
          Vireact doesn’t just grade your video and move on — it gives you a diagnosis, concrete script fixes, and a
          clear prediction so you know what to publish next.
        </p>
      </header>

      <div className="space-y-6">
        <PhaseCard
          step="01"
          title="Diagnose where you’re losing viewers"
          bullets={
            <>
              <Bullet icon={ListChecks}>Answer six questions about your niche, cadence, and goals.</Bullet>
              <Bullet icon={Target}>
                Vireact pinpoints whether you’re bleeding attention in the first three seconds, mid-video, or at the
                payoff.
              </Bullet>
              <Bullet icon={Sparkles}>You get a simple, deterministic diagnosis instead of vague “do better hooks”.</Bullet>
            </>
          }
          visual={<AssetSlot id="phase-1" alt="Quiz in progress on a phone" aspect="4 / 5" />}
        />

        <PhaseCard
          step="02"
          title="Fix the script, not just the thumbnail"
          bullets={
            <>
              <Bullet icon={Wand2}>
                Upload your video and get timestamped feedback cards that call out exactly what to change.
              </Bullet>
              <Bullet icon={Clock3}>
                Each fix points at an exact second in the video and hands you the replacement line.
              </Bullet>
              <Bullet icon={Sparkles}>
                Paste your own hook and get AI rewrites tailored to your niche.
              </Bullet>
            </>
          }
          visual={<ScriptDiffDemo />}
        />

        <PhaseCard
          step="03"
          title="Predict, post, and repeat"
          bullets={
            <>
              <Bullet icon={Target}>
                See an approximate view range before you post, based on similar videos. It is an estimate, not a promise.
              </Bullet>
              <Bullet icon={ListChecks}>
                Compare your “before” and “after” hooks so you can double down on what works.
              </Bullet>
            </>
          }
          visual={
            !hasBeforeAfter ? null : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <AssetSlot
                    id="before-after-before"
                    alt="Before video thumbnail"
                    aspect="9 / 16"
                    rounded
                  />
                  <p className="text-xs text-zinc-300">
                    <span className="font-semibold">Before</span>{' '}
                    {claims.beforeAfter?.verified ? `· ${claims.beforeAfter.before.views} views` : ''}
                  </p>
                </div>
                <div className="space-y-2">
                  <AssetSlot id="before-after-after" alt="After video thumbnail" aspect="9 / 16" rounded />
                  <p className="text-xs text-zinc-300">
                    <span className="font-semibold">After</span>{' '}
                    {claims.beforeAfter?.verified ? `· ${claims.beforeAfter.after.views} views` : ''}
                  </p>
                </div>
              </div>
            </div>
            )
          }
        />
      </div>

      <div className="mt-8 flex justify-center md:justify-start">
        <PrimaryCta location="phases" />
      </div>
    </section>
  );
}

