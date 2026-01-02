import React, { useState } from 'react';
import PricingCard from '@/components/PricingCard';
import PricingToggle from '@/components/PricingToggle';
import { starterFeatures, proFeatures, businessFeatures } from '@/pages/PreLogin/Pricing/pricing-items';
import type { PricingPageProps } from '@/types/pricing';
import FreePlan from '@/pages/PreLogin/Pricing/FreePlan';
import PreLoginPage from '@/components/Layout/PreLoginPage';


const Pricing: React.FC<PricingPageProps> = ({ className }) => {
    const [isYearly, setIsYearly] = useState(true);


    return (
        <PreLoginPage>
            <div className="z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-6xl leading-tight text-white font-bold mb-8">
                        Choose a Plan
                    </h1>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center mb-8">
                        <PricingToggle
                            isOn={isYearly}
                            setIsOn={setIsYearly}
                        />
                    </div>

                    {/* Annual Savings Badge */}
                    {isYearly && (
                        <div className="inline-flex items-center px-5 py-1 rounded-full text-green-500">
                            <span className="">
                                Save up to 50% with annual billing
                            </span>
                        </div>
                    )}
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter Plan */}
                    <div className="lg:col-span-1">
                        <PricingCard
                            isYearly={isYearly}
                            title="Starter"
                            description="For individual creators"
                            price={isYearly ? "$10 USD/mo" : "$15 USD/mo"}
                            originalPrice={15}
                            discountPrice={10}
                            billingPeriod={isYearly ? `$${(10 * 12).toFixed(0)} billed annually` : "Billed monthly"}
                            features={starterFeatures}
                            ctaText="Start Your Free Trial"
                            ctaSubtext="No credit card required."
                        />
                    </div>

                    {/* Pro Plan */}
                    <div className="lg:col-span-1">
                        <PricingCard
                            isYearly={isYearly}
                            title="Pro"
                            description="For professional creators, marketers, & teams"
                            price={isYearly ? "$13 USD/mo" : "$15 USD/mo"}
                            originalPrice={15}
                            discountPrice={13}
                            billingPeriod={isYearly ? `$${(13 * 12).toFixed(0)} billed annually` : "Billed monthly"}
                            features={proFeatures}
                            ctaText="Start Your Free Trial"
                            ctaSubtext="No credit card required."
                            isPopular={true}
                        />
                    </div>

                    {/* Business Plan */}
                    <div className="lg:col-span-1">
                        <PricingCard
                            isYearly={isYearly}
                            title="Business"
                            description="For organizations that need tailored solutions, API, and more"
                            features={businessFeatures}
                            ctaText="Contact Us"
                        />
                    </div>
                </div>

                {/* Free Plan - Bottom Section */}
                <FreePlan />

            </div>
        </PreLoginPage>
    );
};

export default Pricing;