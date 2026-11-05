import { MessageSquareText, Sparkles, UploadCloud, type LucideIcon } from 'lucide-react';
import { Highlight } from './Highlight';
import { PrimaryCta } from './PrimaryCta';

interface EasyStep {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: EasyStep[] = [
  {
    id: '01',
    icon: UploadCloud,
    title: 'Upload a video',
    description: 'Drop in a 5 to 60 second short from TikTok, YouTube Shorts, Instagram or Facebook.',
  },
  {
    id: '02',
    icon: Sparkles,
    title: 'AI analysis',
    description: 'Vireact scores your hook, pacing, audio and captions, scene by scene.',
  },
  {
    id: '03',
    icon: MessageSquareText,
    title: 'Get feedback',
    description: 'See what to cut, what to keep and exactly what to say instead.',
  },
];

const GRID_BG = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
  maskImage: 'radial-gradient(ellipse at top, black 10%, transparent 75%)',
  WebkitMaskImage: 'radial-gradient(ellipse at top, black 10%, transparent 75%)',
} as const;

const StepCard = ({ step, index }: { step: EasyStep; index: number }) => {
  const Icon = step.icon;
  return (
    <li className="group relative rounded-3xl p-px transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">
        <div className="absolute inset-0 bg-white/10" />
        <div
          className="absolute -inset-[60%] animate-[spin_7s_linear_infinite] opacity-70 transition-opacity group-hover:opacity-100 motion-reduce:animate-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, #ec4899 70deg, #f97316 130deg, transparent 200deg)',
            animationDelay: `${index * -2.3}s`,
          }}
        />
      </div>
      <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-[calc(1.5rem-1px)] bg-zinc-950/95 p-6 backdrop-blur-xl md:p-7">
        <div className="pointer-events-none absolute inset-0" style={GRID_BG} aria-hidden="true" />
        <span
          className="pointer-events-none absolute top-4 right-5 font-mono text-5xl font-bold text-white/[0.06] tabular-nums"
          aria-hidden="true"
        >
          {step.id}
        </span>

        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-500/20 to-orange-500/15 shadow-[0_0_32px_rgba(236,72,153,0.35)]">
          <Icon className="h-7 w-7 text-pink-100" aria-hidden="true" />
        </div>

        <p className="relative flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-pink-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400 shadow-[0_0_8px_#ec4899] motion-reduce:animate-none" aria-hidden="true" />
          Step {step.id}
        </p>
        <h3 className="relative !text-2xl text-white">{step.title}</h3>
        <p className="relative text-sm leading-relaxed text-zinc-300">{step.description}</p>

        <div className="relative mt-auto h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400"
            style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </li>
  );
};

/** Futuristic take on the old "The Easiest Way to Go Viral" cards; the how-it-works section under the hero. */
export function EasiestWayCards() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14 md:py-20" aria-labelledby="easiest-way-title">
      <header className="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          How it works
        </p>
        <h2 id="easiest-way-title" className="!text-3xl sm:!text-4xl md:!text-5xl">
          The easiest way to <Highlight>go viral</Highlight>
        </h2>
      </header>

      <div className="relative mb-6 hidden grid-cols-3 md:grid" aria-hidden="true">
        <div className="absolute top-1/2 right-[16.67%] left-[16.67%] h-px -translate-y-1/2 overflow-hidden bg-gradient-to-r from-pink-500/60 via-fuchsia-500/60 to-orange-400/60">
          <div className="h-full w-1/5 animate-[v3-beam_3.2s_linear_infinite] bg-gradient-to-r from-transparent via-white to-transparent motion-reduce:hidden" />
        </div>
        {STEPS.map((step) => (
          <div key={step.id} className="relative flex justify-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-pink-400/50 bg-zinc-950 font-mono text-xs font-semibold text-pink-100 shadow-[0_0_18px_rgba(236,72,153,0.45)]">
              {step.id}
            </span>
          </div>
        ))}
      </div>
      <ol className="grid gap-5 md:grid-cols-3 md:gap-6">
        {STEPS.map((step, i) => (
          <StepCard key={step.id} step={step} index={i} />
        ))}
      </ol>

      <div className="mt-10 flex justify-center">
        <PrimaryCta location="easiest_way" />
      </div>
    </section>
  );
}
