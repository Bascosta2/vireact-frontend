import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';
import PricingCard from '@/components/PricingCard';
import PlanChangeModal from '@/components/PlanChangeModal';
import { TIERS, type Tier, type TierId, type CheckoutPlan } from '@/config/tiers';
import { createCheckoutSession } from '@/api/subscription';
import { ErrorNotification } from '@/utils/toast';
import { useSubscription } from '@/redux/hooks/use-subscription';
import { getCardCta, type CardCta } from './card-cta';

function SubscriptionPlans() {
  const navigate = useNavigate();
  const { plan: currentPlan, refetch, trialEligible, trialDays, trialActive, trialEndsAt, promo, hasBilling } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<TierId | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetPlan, setModalTargetPlan] = useState<CheckoutPlan | null>(null);

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
    await new Promise((r) => setTimeout(r, 2000));
    await refetch();
  };

  const startCheckout = async (tier: Tier, plan: CheckoutPlan, trial: boolean) => {
    try {
      setLoadingTier(tier.id);
      const { url } = await createCheckoutSession(plan, { trial });
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
        void startCheckout(tier, cta.action.plan, cta.action.trial);
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
            Every plan, its exact monthly price, and what's included. Prices in USD.
          </p>
          {trialEligible && (
            <p className="mx-auto mt-4 max-w-xl rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm text-white">
              <span className="font-semibold">Premium and Pro start with a {trialDays}-day free trial.</span> Add a card, pay $0 today,
              and cancel anytime before the trial ends.
            </p>
          )}
          {trialActive && trialEndsAt && (
            <p className="mx-auto mt-4 max-w-xl rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white">
              Your free trial ends on {new Date(trialEndsAt).toLocaleDateString()}. Your card is charged then unless you cancel in Settings.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto pt-3">
          {TIERS.map(tier => {
            const cta = getCardCta(currentPlan, tier, { eligible: trialEligible, days: trialDays }, { unbilled: promo != null && !hasBilling, lifetime: promo?.lifetime === true });
            const isLoadingThis = loadingTier === tier.id;
            const isOtherLoading = loadingTier !== null && !isLoadingThis;

            const buttonDisabled = cta.disabled || isOtherLoading;
            const ctaText = isLoadingThis ? 'Processing...' : cta.label;

            const card = (
              <PricingCard
                key={tier.id}
                tier={tier}
                ctaText={ctaText}
                isCurrent={currentPlan === tier.id}
                priceNote={cta.priceNote}
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
