import { useEffect, useState } from 'react';
import { fetchPublicHooks } from '@/api/library';
import type { LibraryHook } from '@/api/funnel';
import { PrimaryCta } from './PrimaryCta';

const isLibraryEnabled = (): boolean =>
  String(import.meta.env.VITE_LIBRARY ?? '').toLowerCase() === 'true';

/** Real approved public hooks from the library. Renders nothing when the flag is off or no public hooks exist. */
export function LibraryTeaser() {
  const enabled = isLibraryEnabled();
  const [hooks, setHooks] = useState<LibraryHook[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchPublicHooks(6)
      .then((items) => {
        if (!cancelled) setHooks(items);
      })
      .catch(() => {
        if (!cancelled) setHooks([]);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled || hooks.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <header className="mb-6 space-y-3 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Hook library</p>
        <h2 className="!text-3xl sm:!text-4xl">See proven hooks before you hit record.</h2>
      </header>
      <ul className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hooks.map((hook) => (
          <li key={hook.slug} className="rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
            {hook.category && (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-pink-200">{hook.category}</p>
            )}
            <p className="text-base text-white">&ldquo;{hook.displayText}&rdquo;</p>
          </li>
        ))}
      </ul>
      <div className="flex justify-center md:justify-start">
        <PrimaryCta location="library_teaser" />
      </div>
    </section>
  );
}
