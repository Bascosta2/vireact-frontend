import React, { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';
import PricingCard from '@/components/PricingCard';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import { TIERS, type Tier } from '@/config/tiers';
import { createCheckoutSession } from '@/api/subscription';
import { useAuth } from '@/redux/hooks/use-auth';
import { ErrorNotification } from '@/utils/toast';
import type { PricingPageProps } from '@/types/pricing';

const Pricing: React.FC<PricingPageProps> = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [loadingTier, setLoadingTier] = useState<Tier['id'] | null>(null);

    useEffect(() => {
        track('pricing_viewed');
    }, []);

    const handleCtaClick = async (tier: Tier) => {
        track('cta_clicked', { location: 'pricing', tier: tier.id, authenticated: isAuthenticated });
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
            track('checkout_started', { tier: tier.id, plan: tier.checkoutPlan }, { beforeUnload: true });
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pt-3 pb-16">
                    {TIERS.map(tier => {
                        const ctaText =
                            loadingTier === tier.id ? 'Processing...' : tier.ctaLabel;
                        return (
                            <PricingCard
                                key={tier.id}
                                tier={tier}
                                ctaText={ctaText}
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
