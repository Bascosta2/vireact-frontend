export type TierId = 'free' | 'premium' | 'pro' | 'enterprise';
export type CheckoutPlan = 'premium' | 'pro';

export interface Tier {
  id: TierId;
  name: string;
  tagline: string;
  priceMonthly: number | null;
  priceDisplay: string;
  priceSubtext: string;
  checkoutPlan: CheckoutPlan | null;
  isContactSales: boolean;
  ctaLabel: string;
  features: string[];
  highlight?: boolean;
}

export const TIERS: readonly Tier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try Vireact with your first two videos',
    priceMonthly: 0,
    priceDisplay: '$0',
    priceSubtext: 'forever',
    checkoutPlan: null,
    isContactSales: false,
    ctaLabel: 'Get Started',
    features: [
      'Analyze up to 2 videos (lifetime)',
      'Hook, caption, pacing, and audio analysis',
      'Views prediction band',
      'Timestamp-level feedback',
      'AI coaching chat',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'For creators posting consistently',
    priceMonthly: 11.99,
    priceDisplay: '$11.99',
    priceSubtext: 'per month',
    checkoutPlan: 'premium',
    isContactSales: false,
    ctaLabel: 'Get Premium',
    features: [
      '15 video analyses per month',
      'All core analyzers',
      'Views prediction band',
      'Timestamp-level feedback',
      'AI coaching chat',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For serious creators scaling output',
    priceMonthly: 19,
    priceDisplay: '$19',
    priceSubtext: 'per month',
    checkoutPlan: 'pro',
    isContactSales: false,
    ctaLabel: 'Get Pro',
    highlight: true,
    features: [
      '30 video analyses per month',
      'Everything in Premium',
      'Advanced Analytics (emotional triggers, retention drivers)',
      'Psychological profile insights',
      'Weakest-moment detection',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For agencies and teams',
    priceMonthly: null,
    priceDisplay: 'Contact us',
    priceSubtext: 'custom pricing',
    checkoutPlan: null,
    isContactSales: true,
    ctaLabel: 'Contact Sales',
    features: [
      'Unlimited video analyses',
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'Team seats',
      'SLA',
    ],
  },
];

export const getTier = (id: TierId): Tier | undefined =>
  TIERS.find(t => t.id === id);

export const PURCHASABLE_TIERS = TIERS.filter(t => t.checkoutPlan !== null);
