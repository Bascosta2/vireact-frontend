import type { ReactNode } from 'react';
import {
  BarChart3,
  Clock3,
  Gauge,
  History,
  ListOrdered,
  MessageCircle,
  RefreshCw,
  Rocket,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { AssetSlot } from '@/components/marketing/AssetSlot';
import { PrimaryCta } from './PrimaryCta';
import { Highlight } from './Highlight';

const VISUAL_ASPECT = '16 / 9';

const VisualFrame = ({ caption, children }: { caption: string; children: ReactNode }) => (
  <figure className="space-y-2">
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-950/90 to-transparent" aria-hidden="true" />
    </div>
    <figcaption className="text-center text-xs text-zinc-400">{caption}</figcaption>
  </figure>
);

/** Drawn in code, no numbers: the range itself is the point, and an example figure would read as a claim. */
const RangeVisual = () => (
  <div className="flex flex-col justify-center gap-4 px-5" style={{ aspectRatio: VISUAL_ASPECT }} aria-hidden="true">
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Predicted views</p>
    <div className="relative h-3 rounded-full bg-white/10">
      <div className="absolute inset-y-0 left-[18%] right-[22%] rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-orange-400" />
      <div className="absolute top-1/2 left-[52%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-950 shadow-[0_0_16px_rgba(236,72,153,0.7)]" />
    </div>
    <div className="flex justify-between text-xs font-medium">
      <span className="text-zinc-400">Low</span>
      <span className="text-white">Expected</span>
      <span className="text-zinc-400">High</span>
    </div>
  </div>
);

const Bullet = ({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) => (
  <li className="flex items-center gap-2.5 text-sm text-zinc-200">
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-500/15 text-pink-300">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </span>
    <span>{children}</span>
  </li>
);

interface Step {
  step: string;
  title: string;
  bullets: Array<{ icon: LucideIcon; text: string }>;
  visual: ReactNode;
}

const STEPS: Step[] = [
  {
    step: '01',
    title: 'Upload a video',
    bullets: [
      { icon: Gauge, text: 'Virality Score from 0 to 100' },
      { icon: BarChart3, text: 'Hook, pacing, audio and caption scores' },
      { icon: ListOrdered, text: 'Biggest problems ranked first' },
    ],
    visual: (
      <VisualFrame caption="Your analysis report">
        <AssetSlot
          id="phase-1"
          alt="Vireact analysis report with the overall score and hook, pacing, audio and caption scores"
          aspect={VISUAL_ASPECT}
          rounded={false}
          className="!rounded-none !border-0"
          objectPosition="top"
        />
      </VisualFrame>
    ),
  },
  {
    step: '02',
    title: 'Chat with your AI strategist',
    bullets: [
      { icon: MessageCircle, text: "Answers from your video's real scores" },
      { icon: Clock3, text: 'Timestamped fixes, ready to use' },
      { icon: History, text: 'Saved with every video' },
    ],
    visual: (
      <VisualFrame caption="A real answer from the Vireact coach">
        <AssetSlot
          id="step2-chat"
          alt="Vireact coach answering “how exactly should I cut my intro to optimize views?” using the video’s hook and pacing scores"
          aspect={VISUAL_ASPECT}
          rounded={false}
          className="!rounded-none !border-0"
          objectPosition="top"
        />
      </VisualFrame>
    ),
  },
  {
    step: '03',
    title: 'Check the crystal ball, then post',
    bullets: [
      { icon: Target, text: 'Predicted view range before you post' },
      { icon: RefreshCw, text: 'Re-upload and compare scores' },
      { icon: Rocket, text: 'Post the version with the best range' },
    ],
    visual: (
      <VisualFrame caption="An estimate, not a guarantee">
        <RangeVisual />
      </VisualFrame>
    ),
  },
];

export function HowItWorksPhases() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <header className="mb-8 max-w-2xl space-y-3 text-center md:mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">3 steps to your next viral video</p>
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <Highlight>Upload once.</Highlight> Know what to post next.
        </h2>
      </header>

      <ol className="grid gap-4 md:grid-cols-3 md:gap-5">
        {STEPS.map((s) => (
          <li
            key={s.step}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 shadow-sm shadow-black/40 sm:p-5"
          >
            {s.visual}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Step {s.step}</p>
              <h3 className="!text-lg font-semibold text-white">{s.title}</h3>
              <ul className="space-y-2">
                {s.bullets.map((b) => (
                  <Bullet key={b.text} icon={b.icon}>
                    {b.text}
                  </Bullet>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex justify-center">
        <PrimaryCta location="phases" />
      </div>
    </section>
  );
}
