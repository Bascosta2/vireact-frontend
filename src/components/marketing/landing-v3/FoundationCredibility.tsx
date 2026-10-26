import { AssetSlot } from '@/components/marketing/AssetSlot';
import { claims } from '@/content/claims';
import { founderStory } from '@/content/founderStory';
import { assetExists } from '@/content/assets.manifest';

export function FounderCredibility() {
  if (!claims.founderName) return null;

  const accounts = Array.isArray(claims.founderAccounts) ? claims.founderAccounts : [];
  const hasAnalyticsProof = assetExists('proof-analytics');

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <header className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-zinc-900">
            <AssetSlot id="founder-headshot" alt={claims.founderName} aspect="1 / 1" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Who built this</p>
            <h2 className="text-xl font-semibold text-white">{claims.founderName}</h2>
          </div>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Accounts grown */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
          <h3 className="text-sm font-semibold text-white">Accounts grown</h3>
          <p className="text-xs text-zinc-400">
            A sample of the channels behind the patterns Vireact is built on.
          </p>
          <div className="mt-3 space-y-3">
            {accounts.slice(0, 4).map((acc) => (
              <div key={acc.handle} className="flex items-center gap-3">
                <div className="h-9 w-9 overflow-hidden rounded-full border border-zinc-900 bg-zinc-900">
                  <AssetSlot id={acc.pfpSlot} alt={acc.handle} aspect="1 / 1" />
                </div>
                <div className="text-xs">
                  <div className="font-medium text-white">{acc.handle}</div>
                  <div className="text-zinc-400">{acc.followers}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proof screenshot */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
          <h3 className="text-sm font-semibold text-white">Proof from the analytics</h3>
          <p className="text-xs text-zinc-400">
            A real view or follower growth screenshot — blurred wherever you need it before upload.
          </p>
          <div className="mt-3">
            {hasAnalyticsProof ? (
              <AssetSlot id="proof-analytics" alt="Analytics growth screenshot" aspect="16 / 10" />
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-zinc-950/70 px-3 py-6 text-xs text-zinc-400">
                Drop `proof-analytics.webp` into <code>public/brand/</code> to show a real analytics chart here.
              </div>
            )}
          </div>
        </div>

        {/* Founder story */}
        <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
          <h3 className="text-sm font-semibold text-white">Why I built Vireact</h3>
          <p className="text-sm text-zinc-300">{founderStory.paragraph}</p>
        </div>
      </div>
    </section>
  );
}

