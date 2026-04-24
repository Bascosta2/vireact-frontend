import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';
import PricingCard from '@/components/PricingCard';
import { TIERS, type Tier, type TierId } from '@/config/tiers';
import { createCheckoutSession, getSubscription } from '@/api/subscription';
import { ErrorNotification } from '@/utils/toast';
import type { PricingFeature } from '@/types/pricing';

const toCardFeatures = (features: string[]): PricingFeature[] =>
  features.map(text => ({ text, type: 'check' }));

function SubscriptionPlans() {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<TierId | null>(null);
  const [loadingTier, setLoadingTier] = useState<TierId | null>(null);

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

  const handleCtaClick = async (tier: Tier) => {
    if (tier.isContactSales) {
      navigate('/contact');
      return;
    }

    if (!tier.checkoutPlan) {
      return;
    }

    try {
      setLoadingTier(tier.id);
      const { url } = await createCheckoutSession(tier.checkoutPlan);
      window.location.href = url;
    } catch (err: any) {
      setLoadingTier(null);
      const message =
        err?.response?.data?.message || err?.message || 'Failed to start checkout';
      ErrorNotification(message);
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
            const isCurrent = currentPlan === tier.id;
            const freeAndNotOnFree = tier.id === 'free' && currentPlan !== 'free';
            const buttonDisabled =
              isCurrent ||
              freeAndNotOnFree ||
              (loadingTier !== null && loadingTier !== tier.id);

            let ctaText = tier.ctaLabel;
            if (isCurrent) ctaText = 'Current Plan';
            else if (loadingTier === tier.id) ctaText = 'Processing...';

            return (
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
                onClick={() => handleCtaClick(tier)}
              />
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
    </UserPage>
  );
}

export default SubscriptionPlans;
