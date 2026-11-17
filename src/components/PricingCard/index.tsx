import { AlertTriangle, Check, X } from 'lucide-react';
import { planFeatures, type Tier } from '@/config/tiers';

export interface PricingCardProps {
    tier: Tier;
    ctaText: string;
    onClick?: () => void;
    disabled?: boolean;
    /** Shows a "Your plan" badge (logged-in plans page). */
    isCurrent?: boolean;
    /** Replaces the line under the price (e.g. free trial terms). */
    priceNote?: string;
}

/**
 * One plan: name, the monthly price in large type, the button, then every plan row with a green check
 * (included, with the amount when it varies by plan) or an X (not on this plan). Rows come from
 * PLAN_FEATURE_ROWS so the cards line up row by row.
 */
const PricingCard = ({ tier, ctaText, onClick, disabled = false, isCurrent = false, priceNote }: PricingCardProps) => {
    const popular = !!tier.highlight;
    const isCustom = tier.priceMonthly === null;
    return (
        <article
            className={`relative flex h-full flex-col rounded-2xl border bg-zinc-950 p-6 ${
                popular ? 'border-orange-500/70 shadow-[0_0_40px_-12px_rgba(249,115,22,0.55)]' : 'border-white/15'
            }`}
            aria-label={`${tier.name} plan, ${isCustom ? 'custom pricing' : `${tier.priceDisplay} ${tier.priceSubtext}`}`}
        >
            {(popular || isCurrent) && (
                <span
                    className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-semibold ${
                        isCurrent ? 'bg-white text-zinc-950' : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white'
                    }`}
                >
                    {isCurrent ? 'Your plan' : 'Most popular'}
                </span>
            )}

            <h3 className="text-2xl font-semibold tracking-tight text-white normal-case" style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>
                {tier.name}
            </h3>
            <p className="mt-1 min-h-[2.5rem] text-sm text-zinc-400">{tier.tagline}</p>

            <div className="mt-5 flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight text-white tabular-nums">{tier.priceDisplay}</span>
                {!isCustom && <span className="text-sm text-zinc-400">{tier.priceMonthly === 0 ? 'forever' : '/ month'}</span>}
            </div>
            <p className={`mt-1 min-h-5 text-xs ${priceNote ? 'font-medium text-orange-300' : 'text-zinc-500'}`}>
                {priceNote ?? (isCustom ? tier.priceSubtext : tier.priceMonthly === 0 ? 'No card needed' : 'Billed monthly, cancel anytime')}
            </p>

            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={`${popular ? 'btn-secondary' : 'btn-outline'} mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60`}
            >
                {ctaText}
            </button>

            {tier.limits && tier.limits.length > 0 && (
                <div className="mt-5 rounded-xl border border-amber-400/40 bg-amber-400/[0.07] p-3.5" data-testid="plan-limits">
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-amber-300 uppercase">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                        {tier.name} plan limits
                    </p>
                    <ul className="mt-2 space-y-1.5">
                        {tier.limits.map((limit) => (
                            <li key={limit} className="text-sm leading-snug font-medium text-white">
                                {limit}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <ul className="mt-6 space-y-3 border-t border-white/10 pt-5">
                {planFeatures(tier).map(({ id, label, value }) => {
                    const included = value !== false;
                    return (
                        <li key={id} className="flex items-start gap-3">
                            {included ? (
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                                    <Check className="h-3.5 w-3.5 text-green-400" strokeWidth={3} aria-hidden="true" />
                                </span>
                            ) : (
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                                    <X className="h-3.5 w-3.5 text-red-400" strokeWidth={3} aria-hidden="true" />
                                </span>
                            )}
                            <span className={`text-sm leading-snug ${included ? 'text-zinc-200' : 'text-zinc-500'}`}>
                                <span className="sr-only">{included ? 'Included: ' : 'Not included: '}</span>
                                {label}
                                {typeof value === 'string' && <span className="mt-0.5 block font-semibold text-white">{value}</span>}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </article>
    );
};

export default PricingCard;
