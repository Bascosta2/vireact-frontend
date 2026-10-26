import { AssetSlot } from '@/components/marketing/AssetSlot';
import { PrimaryCta } from './PrimaryCta';
import { claims } from '@/content/claims';

const Card = ({
  step,
  title,
  when,
  body,
  valueKey,
  slotId,
}: {
  step: number;
  title: string;
  when: string;
  body: string;
  valueKey: keyof typeof claims.valueAnchors;
  slotId: Parameters<typeof AssetSlot>[0]['id'];
}) => {
  const anchor = claims.valueAnchors?.[valueKey];
  const showValue = anchor?.amount && anchor.verified;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 shadow-sm shadow-black/40 md:flex-row">
      <div className="md:w-2/5">
        <AssetSlot id={slotId} alt={title} aspect="4 / 5" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 md:p-6">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-pink-200">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/20 text-[11px] text-pink-200">
            {step.toString().padStart(2, '0')}
          </span>
          <span>What you get</span>
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-zinc-300">{body}</p>
        <p className="mt-1 text-xs font-medium text-emerald-300">{when}</p>
        {showValue && (
          <p className="mt-1 text-xs text-zinc-400">
            <span className="font-semibold">{anchor.amount}</span> value — FREE
          </p>
        )}
      </div>
    </div>
  );
};

export function FreeStack() {
  const hookCountLabel = claims.hookCount;
  const libraryViews = claims.libraryViews;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <header className="mb-8 max-w-2xl space-y-3 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">
          What you get free, in 2 minutes
        </p>
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Stacked around one primary CTA</h2>
        <p className="text-sm text-zinc-300">
          Answer six questions and you’ll walk away with a concrete plan, new hooks to test, and a clear next step
          inside Vireact — before you ever pay.
        </p>
      </header>
      <div className="space-y-6">
        <Card
          step={1}
          title="Your personalized hook plan"
          body="Six quick questions about your channel so Vireact can pinpoint whether you’re losing people in the first 3 seconds, mid-video, or at the payoff — then match hooks to your niche."
          when="Right after the quiz"
          valueKey="quiz"
          slotId="stack-quiz"
        />
        <Card
          step={2}
          title="A free AI hook rewrite"
          body="Paste your current opening line and get three rewritten hooks you can say on camera today, each designed to hold attention better than the last."
          when="Right after your results"
          valueKey="rewriter"
          slotId="stack-rewriter"
        />
        <Card
          step={3}
          title="The viral hook & story library"
          body={`A growing library of hooks and storytelling structures behind ${libraryViews || 'short-form'} views, so you’re never starting from a blank page again.`}
          when="As soon as you create your account"
          valueKey="library"
          slotId="stack-library"
        />
        <Card
          step={4}
          title="Frame-by-frame video analysis"
          body="Upload a video and see the exact timestamp viewers drop, the specific line that lost them, and the exact script to replace it with."
          when="With your free account (trial billing turns this into your 7-day trial later)"
          valueKey="analysis"
          slotId="stack-analysis"
        />
      </div>
      <div className="mt-8 flex justify-center md:justify-start">
        <PrimaryCta location="free_stack" />
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500 md:text-left">
        Hook count today: {hookCountLabel}. Once the library is live, this will update automatically from real usage.
      </p>
    </section>
  );
}

