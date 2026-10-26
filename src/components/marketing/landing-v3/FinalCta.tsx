import { PrimaryCta } from './PrimaryCta';

export function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
      <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
        Your next video can be the one.
      </h2>
      <p className="mt-3 text-sm text-zinc-300">
        Give Vireact a single short-form video and it will tell you exactly which second is costing you views — and
        what to say instead.
      </p>
      <div className="mt-6 flex justify-center">
        <PrimaryCta location="final" />
      </div>
      <div className="mt-6 flex items-center justify-center gap-3 text-xs text-zinc-400">
        <div className="flex -space-x-2">
          <div className="h-7 w-7 rounded-full border border-zinc-900 bg-zinc-700/80" />
          <div className="h-7 w-7 rounded-full border border-zinc-900 bg-zinc-700/80" />
          <div className="h-7 w-7 rounded-full border border-zinc-900 bg-zinc-700/80" />
        </div>
        <span>Founders, editors, and solo creators already use Vireact to tune their hooks.</span>
      </div>
    </section>
  );
}

