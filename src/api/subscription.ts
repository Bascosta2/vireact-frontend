import Axios from './index';

export interface Subscription {
    _id: string;
    userId: string;
    plan: 'free' | 'starter' | 'pro';
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
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionLimits {
    videosPerMonth: number;
    chatMessagesPerMonth: number;
}

export interface SubscriptionData {
    subscription: Subscription;
    limits: SubscriptionLimits;
}

export const getSubscription = async (): Promise<SubscriptionData> => {
    const response = await Axios.get<{ data: SubscriptionData }>('/subscription');
    return response.data.data;
};

export const createCheckoutSession = async (plan: 'starter' | 'pro'): Promise<{ url: string; sessionId: string }> => {
    const response = await Axios.post<{ data: { url: string; sessionId: string } }>('/subscription/checkout', { plan });
    return response.data.data;
};

export const cancelSubscription = async (): Promise<void> => {
    await Axios.post('/subscription/cancel');
};

export type { Subscription as SubscriptionType };

