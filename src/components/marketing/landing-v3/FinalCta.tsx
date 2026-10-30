import { PrimaryCta } from './PrimaryCta';

export function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
      <h2 className="!text-3xl sm:!text-4xl">Your next video can be the one.</h2>
      <p className="mt-3 text-zinc-300">
        Give Vireact one short-form video and it shows you which second is costing you views, and what to say instead.
      </p>
      <div className="mt-6 flex justify-center">
        <PrimaryCta location="final" />
      </div>
    </section>
  );
}
