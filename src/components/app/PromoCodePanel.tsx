import { useState, type FormEvent } from 'react';
import { CheckCircle2, Gift, Loader2, Sparkles, Ticket } from 'lucide-react';
import { Button, ButtonLink } from '@/components/app/Button';
import { redeemPromoCode } from '@/api/subscription';
import { promoSummary } from '@/lib/promo';
import { useSubscription } from '@/redux/hooks/use-subscription';
import { cn } from '@/lib/utils';

const apiMessage = (err: unknown): string => {
  const e = err as { response?: { status?: number; data?: { message?: string } } };
  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.response?.status === 429) return 'Too many promo code attempts. Try again in 15 minutes.';
  return 'We could not check that code right now. Try again in a moment.';
};

/** Settings > Promo code: enter a code, get a plan. Shows the running promo plan, if any. */
export function PromoCodePanel() {
  const { promo, refetch } = useSubscription();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ title: string; body: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await redeemPromoCode(code.trim());
      setSuccess({
        title: `${result.label} unlocked`,
        body: result.promo ? `You're on ${promoSummary(result.promo)}. Everything in the plan is open now.` : result.message,
      });
      setCode('');
      await refetch();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {promo && (
        <section
          aria-label="Your promo plan"
          className="relative overflow-hidden rounded-2xl border border-accent/30 bg-accent-tint p-5"
          data-testid="active-promo"
        >
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-on-brand shadow-[0_0_20px_rgba(232,103,53,0.35)]" aria-hidden="true">
              <Gift className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="app-label">Active promo</p>
              <p className="mt-1 text-lg font-semibold text-fg">{promoSummary(promo)}</p>
              <p className="mt-1 text-sm text-fg-muted">
                From code <span className="font-mono text-xs uppercase tracking-wider text-fg">{promo.code}</span>.
                {!promo.lifetime && ' Your account goes back to Free when it ends, unless you pick a plan.'}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="app-panel p-5 md:p-6" aria-labelledby="settings-promo">
        <h2 id="settings-promo" className="mb-1 text-lg font-semibold text-fg">Redeem a promo code</h2>
        <p className="mb-5 text-sm text-fg-muted">Have a code from Vireact or a creator you follow? Enter it to unlock its plan.</p>

        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row" noValidate>
          <label className="sr-only" htmlFor="promo-code-input">Promo code</label>
          <div
            className={cn(
              'flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border bg-white/[0.03] px-4 transition-colors focus-within:border-accent/60 focus-within:shadow-[0_0_0_3px_rgba(232,103,53,0.15)]',
              error ? 'border-danger/60' : 'border-line'
            )}
          >
            <Ticket className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
            <input
              id="promo-code-input"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter code"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={64}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'promo-code-error' : undefined}
              className="min-w-0 flex-1 bg-transparent font-mono text-sm uppercase tracking-[0.18em] text-fg outline-none placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-fg-subtle"
            />
          </div>
          <Button type="submit" disabled={!code.trim() || busy} className="h-12 sm:px-6">
            {busy ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
            {busy ? 'Checking' : 'Redeem'}
          </Button>
        </form>

        {error && (
          <p id="promo-code-error" role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}

        {success && (
          <div role="status" className="mt-4 flex items-start gap-3 rounded-xl border border-success/30 bg-success/[0.07] p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg">{success.title}</p>
              <p className="mt-0.5 text-sm text-fg-muted">{success.body}</p>
              <ButtonLink to="/new" size="sm" className="mt-3">
                Analyze a video
              </ButtonLink>
            </div>
          </div>
        )}

        <p className="mt-5 text-xs text-fg-subtle">Each code works once per account. Codes don't apply to plans billed through Stripe.</p>
      </section>
    </div>
  );
}
