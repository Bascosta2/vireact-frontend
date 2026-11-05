import { BookOpen, Brain, ChevronRight, PenLine, TrendingUp, Users } from 'lucide-react';
import { claims } from '@/content/claims';
import { PrimaryCta } from './PrimaryCta';
import { Highlight } from './Highlight';

const STEPS = [
  { id: '01', label: 'Handwritten notes', Icon: PenLine },
  { id: '02', label: 'Repeatable patterns', Icon: BookOpen },
  { id: '03', label: 'Vireact algorithm', Icon: Brain },
  { id: '04', label: 'Your next video', Icon: TrendingUp },
] as const;

/** Founder playbook under How it works. Hidden until the owner-confirmed reach claim is verified. */
export function FounderCredibility() {
  const reach = claims.founderReach;
  if (!reach.verified || !reach.followers || !reach.monthlyViews) return null;

  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden px-4 py-14 md:py-20" aria-labelledby="founder-playbook-title">
      <div
        className="pointer-events-none absolute inset-x-8 top-10 h-56 rounded-full bg-pink-500/10 blur-3xl"
        aria-hidden="true"
      />

      <header className="relative mb-10 flex flex-col items-center gap-4 text-center md:mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">The founder playbook</p>
        <h2 id="founder-playbook-title" className="max-w-4xl !text-3xl sm:!text-4xl md:!text-5xl">
          Trained on the system that grew <Highlight>{reach.followers} followers</Highlight>
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
          Vireact is not generic AI. The algorithm is trained on handwritten notes and the same strategies that
          consistently produced {reach.monthlyViews} views a month.
        </p>
      </header>

      <ul className="relative grid gap-4 md:grid-cols-3">
        <li className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-lg shadow-black/40 backdrop-blur">
          <Users className="h-5 w-5 text-pink-300" aria-hidden="true" />
          <p className="mt-4 bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-4xl font-extrabold tabular-nums text-transparent md:text-5xl">
            {reach.followers}
          </p>
          <p className="mt-2 text-sm font-medium text-white">Followers generated</p>
          <p className="mt-1 text-sm text-zinc-400">Across the accounts this playbook was built on.</p>
        </li>
        <li className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-lg shadow-black/40 backdrop-blur">
          <TrendingUp className="h-5 w-5 text-orange-300" aria-hidden="true" />
          <p className="mt-4 bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-4xl font-extrabold tabular-nums text-transparent md:text-5xl">
            {reach.monthlyViews}
          </p>
          <p className="mt-2 text-sm font-medium text-white">Views per month</p>
          <p className="mt-1 text-sm text-zinc-400">A consistent monthly output, not a one-off viral hit.</p>
        </li>
        <li className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-lg shadow-black/40 backdrop-blur">
          <PenLine className="h-5 w-5 text-pink-200" aria-hidden="true" />
          <p className="mt-4 text-4xl font-extrabold text-white md:text-5xl">Notes</p>
          <p className="mt-2 text-sm font-medium text-white">Handwritten strategies</p>
          <p className="mt-1 text-sm text-zinc-400">The model is trained on that playbook, not scraped guesswork.</p>
        </li>
      </ul>

      <ol className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="How the playbook became Vireact">
        {STEPS.map((step, i) => (
          <li key={step.id} className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-pink-400/30 bg-pink-500/10">
              <step.Icon className="h-4 w-4 text-pink-100" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{step.id}</p>
              <p className="text-sm font-medium text-white">{step.label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="pointer-events-none absolute -right-2 hidden h-4 w-4 text-pink-300/70 lg:block" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-10 flex justify-center">
        <PrimaryCta location="credibility" />
      </div>
    </section>
  );
}
