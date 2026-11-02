import { PrimaryCta } from './PrimaryCta';

export function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
      <h2 className="!text-3xl sm:!text-4xl">See how your next video does before you post it.</h2>
      <p className="mt-3 text-zinc-300">
        Upload one short video. Vireact predicts your views, shows the second you lose people, and tells you what to say instead.
      </p>
      <div className="mt-6 flex justify-center">
        <PrimaryCta location="final" />
      </div>
    </section>
  );
}
