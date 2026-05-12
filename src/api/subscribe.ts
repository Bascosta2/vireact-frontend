import axios from 'axios';
import { VITE_BACKEND_URL } from '@/constants';

export interface SubscribeResponse {
    success: boolean;
    data?: {
        ok: boolean;
        alreadySubscribed?: boolean;
        simulated?: boolean;
    };
    message?: string;
}

/**
 * POST to /api/subscribe (NOT /api/v1/...) — the public, unversioned endpoint
 * used by the /viral-hooks PDF lead-gen page. Uses a one-off axios call instead
 * of the shared `@/api` instance because that instance has baseURL `/api/v1`
 * baked in and `/api/subscribe` lives outside the versioned namespace.
 */
export async function subscribeEmail(email: string): Promise<SubscribeResponse> {
    const useProxy = import.meta.env.DEV;
    const baseURL = useProxy ? '' : (VITE_BACKEND_URL || '');
    const url = `${baseURL}/api/subscribe`;

    const res = await axios.post(
        url,
        { email, source: 'viral-hooks' },
        {
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            withCredentials: true,
            timeout: 15000,
        }
    );
    return res.data as SubscribeResponse;
}
