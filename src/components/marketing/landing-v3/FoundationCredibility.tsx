import { AssetSlot } from '@/components/marketing/AssetSlot';
import { claims } from '@/content/claims';
import { founderStory } from '@/content/founderStory';
import { assetExists } from '@/content/assets.manifest';
import { PrimaryCta } from './PrimaryCta';

/** Hidden entirely until `claims.founderName` is set; individual cards hide when they have no real content. */
export function FounderCredibility() {
  if (!claims.founderName) return null;

  const accounts = claims.founderAccounts.filter((a) => a.handle && a.followers);
  const hasAnalyticsProof = assetExists('proof-analytics');
  const showDevHint = !import.meta.env.PROD && !hasAnalyticsProof;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <header className="mb-8 flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-zinc-900">
          <AssetSlot id="founder-headshot" alt={claims.founderName} aspect="1 / 1" className="!rounded-full" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-200">Who built this</p>
          <h2 className="!text-2xl">{claims.founderName}</h2>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {accounts.length > 0 && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
            <h3 className="text-sm font-semibold text-white">Accounts grown</h3>
            <ul className="mt-3 space-y-3">
              {accounts.slice(0, 4).map((acc) => (
                <li key={acc.handle} className="flex items-center gap-3">
                  <div className="h-9 w-9 overflow-hidden rounded-full border border-zinc-900 bg-zinc-900">
                    <AssetSlot id={acc.pfpSlot} alt="" aspect="1 / 1" className="!rounded-full" />
                  </div>
                  <div className="text-xs">
                    <div className="font-medium text-white">{acc.handle}</div>
                    <div className="text-zinc-300">{acc.followers}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(hasAnalyticsProof || showDevHint) && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
            <h3 className="text-sm font-semibold text-white">Proof from the analytics</h3>
            {hasAnalyticsProof ? (
              <AssetSlot id="proof-analytics" alt="Analytics growth screenshot" aspect="16 / 10" />
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 px-3 py-6 text-xs text-zinc-300">
                Dev only: drop <code>proof-analytics.webp</code> into <code>public/brand/</code>.
              </div>
            )}
          </div>
        )}

        {founderStory.verified && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-5">
            <h3 className="text-sm font-semibold text-white">Why I built Vireact</h3>
            <p className="text-sm text-zinc-300">{founderStory.paragraph}</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center md:justify-start">
        <PrimaryCta location="credibility" />
      </div>
    </section>
  );
}
