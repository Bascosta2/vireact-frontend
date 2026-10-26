import { useMemo } from 'react';
import { PrimaryCta } from './PrimaryCta';

const isLibraryEnabled = (): boolean =>
  String(import.meta.env.VITE_LIBRARY ?? '').toLowerCase() === 'true';

export function LibraryTeaser() {
  const libraryOn = useMemo(() => isLibraryEnabled(), []);

  if (!libraryOn) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <header className="mb-6 space-y-3 text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Hook & story library</p>
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          See proven hooks before you hit record.
        </h2>
        <p className="text-sm text-zinc-300">
          Once the owner approves public hooks, this section will show a rotating preview of hooks from the Vireact
          library — matched to the problems creators care about most.
        </p>
      </header>
      <div className="mb-6 rounded-2xl border border-dashed border-white/15 bg-zinc-950/60 p-6 text-sm text-zinc-300">
        Library preview coming soon. After `library_items` are approved and exported, this will render six public hook
        cards plus a &ldquo;Browse the library&rdquo; link into the in-app library.
      </div>
      <div className="flex justify-center md:justify-between md:items-center gap-4">
        <p className="max-w-xl text-xs text-zinc-400 md:text-sm">
          Owner note: once `VITE_LIBRARY` is on and public hooks exist, wire this section to either the live
          `/api/v1/library/items` endpoint or `library.public.json`. For now it stays hidden to end users.
        </p>
        <PrimaryCta location="library_teaser" />
      </div>
    </section>
  );
}

