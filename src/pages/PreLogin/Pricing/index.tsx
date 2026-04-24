import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PricingCard from '@/components/PricingCard';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import { TIERS, type Tier } from '@/config/tiers';
import { createCheckoutSession } from '@/api/subscription';
import { useAuth } from '@/redux/hooks/use-auth';
import { ErrorNotification } from '@/utils/toast';
import type { PricingPageProps, PricingFeature } from '@/types/pricing';

const toCardFeatures = (features: string[]): PricingFeature[] =>
    features.map(text => ({ text, type: 'check' }));

const Pricing: React.FC<PricingPageProps> = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [loadingTier, setLoadingTier] = useState<Tier['id'] | null>(null);

    const handleCtaClick = async (tier: Tier) => {
        if (tier.id === 'free') {
            navigate('/signup');
            return;
        }

        if (tier.isContactSales) {
            navigate('/contact');
            return;
        }

        if (!tier.checkoutPlan) {
            return;
        }

        if (!isAuthenticated) {
            navigate(`/signup?intent=${tier.id}`);
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
        <PreLoginPage>
            <div className="z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-6xl leading-tight text-white font-bold mb-4">
                        Choose a Plan
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Start free, upgrade when you need more analyses. Monthly billing, cancel anytime.
                    </p>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pb-16">
                    {TIERS.map(tier => {
                        const ctaText =
                            loadingTier === tier.id ? 'Processing...' : tier.ctaLabel;
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
                                disabled={loadingTier !== null && loadingTier !== tier.id}
                                onClick={() => handleCtaClick(tier)}
                            />
                        );
                    })}
                </div>
            </div>
        </PreLoginPage>
    );
};

export default Pricing;
