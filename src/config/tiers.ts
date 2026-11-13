export type TierId = 'free' | 'premium' | 'pro' | 'enterprise';
export type CheckoutPlan = 'premium' | 'pro';

/**
 * Rows every plan card shows, in this order, so plans compare line by line.
 * Values mirror the backend limits (vireact-backend/src/constants.js: PLAN_LIMITS, LIFETIME_FREE_VIDEO_LIMIT,
 * EDITOR_LIMITS, STRATEGY_LIMITS, PLAN_FEATURES). Change both together.
 */
export const PLAN_FEATURE_ROWS = [
  { id: 'analyses', label: 'Video analyses' },
  { id: 'scores', label: 'Hook, pacing, audio and caption scores' },
  { id: 'views', label: 'Views prediction' },
  { id: 'feedback', label: 'Second-by-second fixes and hook rewrites' },
  { id: 'chat', label: 'AI coach chat' },
  { id: 'editor', label: 'AI video edits' },
  { id: 'advanced', label: 'Advanced Analytics: emotional triggers, retention drivers, weakest moment' },
  { id: 'strategy', label: '2-week AI posting plan' },
  { id: 'support', label: 'Priority support' },
  { id: 'team', label: 'Team seats, custom integrations and SLA' },
] as const;

export type PlanFeatureId = (typeof PLAN_FEATURE_ROWS)[number]['id'];

/** false: not on this plan. true: included. string: included, with this amount. */
export type PlanFeatureValue = boolean | string;

export interface Tier {
  id: TierId;
  name: string;
  tagline: string;
  /** Monthly price in USD; null for custom pricing. Matches the live Stripe prices. */
  priceMonthly: number | null;
  priceDisplay: string;
  priceSubtext: string;
  checkoutPlan: CheckoutPlan | null;
  isContactSales: boolean;
  ctaLabel: string;
  includes: Record<PlanFeatureId, PlanFeatureValue>;
  highlight?: boolean;
}

export const TIERS: readonly Tier[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try Vireact on your first two videos',
    priceMonthly: 0,
    priceDisplay: '$0',
    priceSubtext: 'forever',
    checkoutPlan: null,
    isContactSales: false,
    ctaLabel: 'Get Started',
    includes: {
      analyses: '2 videos in total',
      scores: true,
      views: true,
      feedback: true,
      chat: '20 messages / month',
      editor: '1 / month',
      advanced: false,
      strategy: false,
      support: false,
      team: false,
    },
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
    includes: {
      analyses: '15 / month',
      scores: true,
      views: true,
      feedback: true,
      chat: '100 messages / month',
      editor: '5 / month',
      advanced: false,
      strategy: '3 / month',
      support: true,
      team: false,
    },
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
    includes: {
      analyses: '30 / month',
      scores: true,
      views: true,
      feedback: true,
      chat: '500 messages / month',
      editor: '20 / month',
      advanced: true,
      strategy: '10 / month',
      support: true,
      team: false,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For agencies and teams',
    priceMonthly: null,
    priceDisplay: 'Custom',
    priceSubtext: 'contact us for pricing',
    checkoutPlan: null,
    isContactSales: true,
    ctaLabel: 'Contact Sales',
    includes: {
      analyses: 'Unlimited',
      scores: true,
      views: true,
      feedback: true,
      chat: 'Unlimited',
      editor: '60 / month',
      advanced: true,
      strategy: '30 / month',
      support: 'Dedicated',
      team: true,
    },
  },
];

/** Feature rows for a plan card, in the shared order. */
export const planFeatures = (tier: Tier) =>
  PLAN_FEATURE_ROWS.map((row) => ({ id: row.id, label: row.label, value: tier.includes[row.id] }));

export const getTier = (id: TierId): Tier | undefined =>
  TIERS.find(t => t.id === id);

export const PURCHASABLE_TIERS = TIERS.filter(t => t.checkoutPlan !== null);
