import type { CheckoutPlan, Tier, TierId } from '@/config/tiers';

/** What a plan card's button says and does for the signed-in creator's current plan. */
export type CardAction =
  | { kind: 'noop' }
  | { kind: 'contact' }
  | { kind: 'checkout'; plan: CheckoutPlan; trial: boolean }
  | { kind: 'switch'; plan: CheckoutPlan };

export interface CardCta {
  label: string;
  disabled: boolean;
  tooltip?: string;
  action: CardAction;
  /** Line under the price (free trial terms). */
  priceNote?: string;
}

const MANAGE_BILLING_TOOLTIP = 'Use Manage Billing to cancel your subscription';

export const getCardCta = (currentPlan: TierId | null, tier: Tier, trial: { eligible: boolean; days: number } = { eligible: false, days: 7 }): CardCta => {
  if (currentPlan === tier.id) {
    return { label: 'Current Plan', disabled: true, action: { kind: 'noop' } };
  }

  // Enterprise customers manage everything via sales â€” every other tile points to /contact.
  if (currentPlan === 'enterprise') {
    return { label: 'Contact Sales', disabled: false, action: { kind: 'contact' } };
  }

  if (tier.isContactSales) {
    return { label: 'Contact Sales', disabled: false, action: { kind: 'contact' } };
  }

  // Free user (or unauthenticated read failure) â€” original checkout flow preserved.
  if (currentPlan === null || currentPlan === 'free') {
    if (tier.checkoutPlan) {
      // Accounts that never had a trial or a plan start with the free trial: card now, first charge later.
      if (trial.eligible) {
        return {
          label: `Start ${trial.days}-day free trial`,
          disabled: false,
          priceNote: `${trial.days} days free, then billed monthly`,
          action: { kind: 'checkout', plan: tier.checkoutPlan, trial: true },
        };
      }
      return {
        label: tier.ctaLabel,
        disabled: false,
        action: { kind: 'checkout', plan: tier.checkoutPlan, trial: false },
      };
    }
    return { label: tier.ctaLabel, disabled: true, action: { kind: 'noop' } };
  }

  // Paid user (premium or pro) interacting with non-current, non-enterprise tile.
  if (tier.id === 'free') {
    return {
      label: 'Downgrade to Free',
      disabled: true,
      tooltip: MANAGE_BILLING_TOOLTIP,
      action: { kind: 'noop' },
    };
  }

  if (tier.id === 'premium') {
    return {
      label: 'Switch to Premium',
      disabled: false,
      action: { kind: 'switch', plan: 'premium' },
    };
  }

  if (tier.id === 'pro') {
    return {
      label: 'Switch to Pro',
      disabled: false,
      action: { kind: 'switch', plan: 'pro' },
    };
  }

  return { label: tier.ctaLabel, disabled: true, action: { kind: 'noop' } };
};
