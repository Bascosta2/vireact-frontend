import Axios from './index';
import type { CheckoutPlan, TierId } from '../config/tiers';

export interface Subscription {
    _id: string;
    userId: string;
    plan: TierId;
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    usage: {
        videosUsed: number;
        chatMessagesUsed: number;
        lastResetAt: string;
    };
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    stripePriceId?: string;
    /** Set by Stripe invoice.payment_failed; cleared on successful invoice payment. */
    paymentFailed?: boolean;
    paymentFailedAt?: string;
    /** When the running free trial ends (first charge). */
    trialEndsAt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionLimits {
    /** Per-period video analysis cap. `null` represents unlimited (Enterprise tier). */
    videosPerMonth: number | null;
    /** Per-period chat message cap. `null` represents unlimited (Enterprise tier). */
    chatMessagesPerMonth: number | null;
    /** Monotonic count of one-time free trial videos used (User model, lifetime cap). */
    lifetimeFreeVideosUsed: number;
    /** Server-side cap for the lifetime free-trial (from LIFETIME_FREE_VIDEO_LIMIT). */
    lifetimeFreeVideoLimit: number;
}

/** Free trial of a paid plan (card required, $0 today). The backend decides who can start one. */
export interface TrialInfo {
    eligible: boolean;
    days: number;
    /** A trial is running now. */
    active: boolean;
    endsAt: string | null;
    /** Caps that apply while trialing. */
    videoLimit?: number;
    chatMessageLimit?: number;
}

export interface SubscriptionData {
    subscription: Subscription;
    limits: SubscriptionLimits;
    trial?: TrialInfo;
}

export const getSubscription = async (): Promise<SubscriptionData> => {
    const response = await Axios.get<{ data: SubscriptionData }>('/subscription');
    return response.data.data;
};

/** `trial: true` starts the plan with the free trial (the backend refuses if the account is not eligible). */
export const createCheckoutSession = async (plan: CheckoutPlan, opts: { trial?: boolean } = {}): Promise<{ url: string; sessionId: string }> => {
    const response = await Axios.post<{ data: { url: string; sessionId: string } }>('/subscription/checkout', opts.trial ? { plan, trial: true } : { plan });
    return response.data.data;
};

export const createPortalSession = async (): Promise<{ url: string }> => {
    const response = await Axios.post<{ data: { url: string } }>('/subscription/portal');
    return response.data.data;
};

export interface PlanChangePreview {
    currentPlan: TierId;
    targetPlan: CheckoutPlan;
    currency: string;
    immediateCharge: number;
    nextInvoiceAmount: number;
    nextBillingDate: string;
    prorationDate: string;
}

export const previewPlanChange = async (plan: CheckoutPlan): Promise<PlanChangePreview> => {
    const response = await Axios.post<{ data: PlanChangePreview }>('/subscription/preview-change', { plan });
    return response.data.data;
};

export const changePlan = async (plan: CheckoutPlan): Promise<{ newPlan: string; stripeSubscriptionStatus: string }> => {
    const response = await Axios.post<{ data: { newPlan: string; stripeSubscriptionStatus: string } }>('/subscription/change-plan', { plan });
    return response.data.data;
};

export const cancelSubscription = async (): Promise<void> => {
    await Axios.post('/subscription/cancel');
};

export type { Subscription as SubscriptionType };

