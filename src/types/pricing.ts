export interface PricingFeature {
    text: string;
    type: 'check' | 'warning';
}

export interface PricingCardProps {
    isYearly: boolean;
    title: string;
    description: string;
    price?: string;
    originalPrice?: number;
    discountPrice?: number;
    billingPeriod?: string;
    features: PricingFeature[];
    ctaText: string;
    ctaSubtext?: string;
    isPopular?: boolean;
    isDisabled?: boolean;
    className?: string;
}

export interface PricingToggleProps {
    isOn: boolean;
    setIsOn: (isOn: boolean) => void;
    className?: string;
}

export interface PricingPageProps {
    className?: string;
}
