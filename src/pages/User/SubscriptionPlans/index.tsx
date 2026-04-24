import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';
import PricingCard from '@/components/PricingCard';
import PlanChangeModal from '@/components/PlanChangeModal';
import { TIERS, type Tier, type TierId, type CheckoutPlan } from '@/config/tiers';
import { createCheckoutSession, getSubscription } from '@/api/subscription';
import { ErrorNotification } from '@/utils/toast';
import type { PricingFeature } from '@/types/pricing';

const toCardFeatures = (features: string[]): PricingFeature[] =>
  features.map(text => ({ text, type: 'check' }));

type CardAction =
  | { kind: 'noop' }
  | { kind: 'contact' }
  | { kind: 'checkout'; plan: CheckoutPlan }
  | { kind: 'switch'; plan: CheckoutPlan };

interface CardCta {
  label: string;
  disabled: boolean;
  tooltip?: string;
  action: CardAction;
}

const MANAGE_BILLING_TOOLTIP = 'Use Manage Billing to cancel your subscription';

const getCardCta = (currentPlan: TierId | null, tier: Tier): CardCta => {
  if (currentPlan === tier.id) {
    return { label: 'Current Plan', disabled: true, action: { kind: 'noop' } };
  }

  // Enterprise customers manage everything via sales — every other tile points to /contact.
  if (currentPlan === 'enterprise') {
    return { label: 'Contact Sales', disabled: false, action: { kind: 'contact' } };
  }

  if (tier.isContactSales) {
    return { label: 'Contact Sales', disabled: false, action: { kind: 'contact' } };
  }

  // Free user (or unauthenticated read failure) — original checkout flow preserved.
  if (currentPlan === null || currentPlan === 'free') {
    if (tier.checkoutPlan) {
      return {
        label: tier.ctaLabel,
        disabled: false,
        action: { kind: 'checkout', plan: tier.checkoutPlan },
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

function SubscriptionPlans() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<TierId | null>(null);
  const [loadingTier, setLoadingTier] = useState<TierId | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetPlan, setModalTargetPlan] = useState<CheckoutPlan | null>(null);

  const refetchSubscription = async () => {
    try {
      const data = await getSubscription();
      setCurrentPlan(data.subscription.plan);
    } catch {
      // leave currentPlan as-is on transient error
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSubscription();
        if (!cancelled) {
          setCurrentPlan(data.subscription.plan);
        }
      } catch {
        if (!cancelled) {
          setCurrentPlan(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openSwitchModal = (plan: CheckoutPlan) => {
    setModalTargetPlan(plan);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTargetPlan(null);
  };

  // Stripe webhook typically lands within ~1s. Wait 2s before refetch to keep
  // the UI eventually-consistent without polling. Webhook is the source of
  // truth for the plan field; this is only a UI freshness compromise.
  const handleSwitchSuccess = async () => {
    await new Promise(r => setTimeout(r, 2000));
    await refetchSubscription();
  };

  const startCheckout = async (tier: Tier, plan: CheckoutPlan) => {
    try {
      setLoadingTier(tier.id);
      const { url } = await createCheckoutSession(plan);
      window.location.href = url;
    } catch (err: any) {
      setLoadingTier(null);
      const message =
        err?.response?.data?.message || err?.message || 'Failed to start checkout';
      ErrorNotification(message);
    }
  };

  const handleCardClick = (tier: Tier, cta: CardCta) => {
    switch (cta.action.kind) {
      case 'contact':
        navigate('/contact');
        return;
      case 'checkout':
        void startCheckout(tier, cta.action.plan);
        return;
      case 'switch':
        openSwitchModal(cta.action.plan);
        return;
      case 'noop':
      default:
        return;
    }
  };

  return (
    <UserPage>
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/profile')}
            className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-2"
          >
            ← Back to Subscription
          </button>
          <h1 className="text-white text-3xl font-bebas-neue mb-3">Choose Your Plan</h1>
          <p className="text-gray-400 text-lg">
            Upgrade your account to analyze more videos and get more insights
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {TIERS.map(tier => {
            const cta = getCardCta(currentPlan, tier);
            const isLoadingThis = loadingTier === tier.id;
            const isOtherLoading = loadingTier !== null && !isLoadingThis;

            const buttonDisabled = cta.disabled || isOtherLoading;
            const ctaText = isLoadingThis ? 'Processing...' : cta.label;

            const card = (
              <PricingCard
                key={tier.id}
                isYearly={false}
                title={tier.name}
                description={tier.tagline}
                price={`${tier.priceDisplay} ${tier.priceSubtext}`}
                billingPeriod={tier.priceSubtext}
                features={toCardFeatures(tier.features)}
                ctaText={ctaText}
                isPopular={!!tier.highlight}
                disabled={buttonDisabled}
                onClick={() => handleCardClick(tier, cta)}
              />
            );

            return cta.tooltip ? (
              <div key={tier.id} title={cta.tooltip}>
                {card}
              </div>
            ) : (
              card
            );
          })}
        </div>

        <div className="mt-12 text-center space-y-2">
          <p className="text-gray-400 text-sm">Secure payment powered by Stripe</p>
          <p className="text-gray-400 text-sm">Cancel anytime, no questions asked</p>
          <p className="text-gray-400 text-sm">
            Usage resets monthly on your subscription anniversary
          </p>
        </div>
      </div>

      {modalOpen && modalTargetPlan && (
        <PlanChangeModal
          isOpen={modalOpen}
          targetPlan={modalTargetPlan}
          onClose={closeModal}
          onSuccess={handleSwitchSuccess}
        />
      )}
    </UserPage>
  );
}

export default SubscriptionPlans;
