import {
  ListChecks,
  Sparkles,
  Clock3,
  Target,
  Gauge,
  BarChart3,
  ListOrdered,
  MessageCircle,
  BookOpen,
  History,
  RefreshCw,
  Rocket,
  Eye,
} from 'lucide-react';
import { AssetSlot } from '@/components/marketing/AssetSlot';
import { PrimaryCta } from './PrimaryCta';
import { demoFeedback } from '@/content/demoFeedback';
import { Highlight } from './Highlight';
import { claims } from '@/content/claims';
import { assetExists } from '@/content/assets.manifest';
import { GrowthStrip } from './GrowthStrip';

const ReportVisual = () => (
  <figure className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
    <div className="w-full max-w-[210px] sm:max-w-[240px]">
      <AssetSlot id="phase-1" alt="Vireact analysis report with virality, hook, pacing, audio and caption scores" aspect="4 / 5" />
    </div>
    <figcaption className="text-center text-xs text-zinc-300">Your analysis report: every score in one place</figcaption>
  </figure>
);

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
    className={`grid gap-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-4 shadow-sm sm:p-6 shadow-black/40 ${
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

const clock = (seconds: number) => `0:${String(seconds).padStart(2, '0')}`;

const ScriptDiffDemo = () => (
  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-emerald-50">
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Frame-by-frame fix example</p>
    <ul className="space-y-2.5">
      {demoFeedback.map((item) => (
        <li key={item.timestampStart} className="space-y-1">
          <p className="text-[11px] font-semibold text-emerald-300">
            <span className="font-mono">
              {clock(item.timestampStart)} to {clock(item.timestampEnd)}
            </span>{' '}
            · {item.label}
          </p>
          {item.before && <p className="text-xs text-zinc-400 line-through">{item.before}</p>}
          <p className="rounded-md bg-emerald-500/15 px-2 py-1 text-[13px] leading-snug">{item.after}</p>
        </li>
      ))}
    </ul>
  </div>
);

const StrategistVisual = () => (
  <div className="mx-auto max-w-[420px] space-y-3 md:max-w-none">
    <figure className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-white/10">
        <AssetSlot
          id="step2-chat"
          alt="Vireact coach answering “how exactly should I cut my intro to optimize views?” with fixes based on the video’s hook, pacing and caption scores"
          aspect="1134 / 1002"
          rounded={false}
        />
      </div>
      <figcaption className="text-center text-xs text-zinc-300">A real answer from the Vireact coach</figcaption>
    </figure>
    <ScriptDiffDemo />
  </div>
);

export function HowItWorksPhases() {
  // Placeholders stay visible in dev so missing assets are obvious; production hides the empty visual.
  const hasBeforeAfter =
    !import.meta.env.PROD || (assetExists('before-after-before') && assetExists('before-after-after'));
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <GrowthStrip />
      <header className="mb-8 max-w-2xl space-y-3 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">
          3 steps to your next viral video
        </p>
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <Highlight>Upload once.</Highlight> Know what to post next.
        </h2>
        <p className="text-sm text-zinc-300">
          Vireact predicts how your video will do, shows where viewers drop off, and tells you what to change before
          you post.
        </p>
      </header>

      <div className="space-y-6">
        <PhaseCard
          step="01"
          title="Upload a video"
          bullets={
            <>
              <Bullet icon={Eye}>
                Stop guessing what the algorithm wants. See what keeps people watching before you spend hours posting.
              </Bullet>
              <Bullet icon={Gauge}>Get a Virality Score from 0 to 100, so you know if a video is ready.</Bullet>
              <Bullet icon={BarChart3}>
                Your hook, pacing, audio and captions each get their own score. Your weakest spot jumps out.
              </Bullet>
              <Bullet icon={Target}>See your Hook Swipe Rate: how many viewers are likely to scroll past your opening.</Bullet>
              <Bullet icon={ListOrdered}>Every problem is ranked by how much it hurts, so you fix the biggest one first.</Bullet>
            </>
          }
          visual={<ReportVisual />}
        />

        <PhaseCard
          step="02"
          title="Your personalized creative strategist"
          bullets={
            <>
              <Bullet icon={MessageCircle}>
                Ask anything about your video. Every answer uses its real scores and every scene.
              </Bullet>
              <Bullet icon={Sparkles}>It tells you why each score is what it is, in plain words.</Bullet>
              <Bullet icon={Clock3}>
                Every fix comes with a timestamp and the new line, cut or caption to use.
              </Bullet>
              <Bullet icon={BookOpen}>Its advice comes from a library of hooks that already worked.</Bullet>
              <Bullet icon={History}>Your chat stays saved with each video, so you can pick up where you left off.</Bullet>
            </>
          }
          visual={<StrategistVisual />}
        />

        <PhaseCard
          step="03"
          title="Check the crystal ball, then post"
          bullets={
            <>
              <Bullet icon={Target}>
                Get a predicted view range before you post, based on how similar videos performed. It’s an estimate, not a guarantee.
              </Bullet>
              <Bullet icon={ListChecks}>
                Compare your old and new hooks and keep what works.
              </Bullet>
              <Bullet icon={BarChart3}>See a low, expected and high range, so you know the realistic floor and ceiling.</Bullet>
              <Bullet icon={RefreshCw}>Made changes? Upload the new cut and check if your scores went up.</Bullet>
              <Bullet icon={Rocket}>Post the version with the best predicted range. Skip the ones likely to flop.</Bullet>
            </>
          }
          visual={
            !hasBeforeAfter ? null : (
            <div className="space-y-3">
              <div className="mx-auto grid max-w-[320px] grid-cols-2 gap-3 md:max-w-none">
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

