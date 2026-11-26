import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/redux/hooks/use-auth';
import { useUser } from '@/redux/hooks/use-user';
import Axios from '@/api';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';
import { track } from '@/lib/analytics';
import { isFunnelV2Enabled } from '@/funnel/cta';
import { safePostAuthPath } from '@/funnel/redirect';

type Options = {
    redirectOnSuccess?: string;
    redirectOnFailure?: string;
    showToastOnSuccess?: boolean;
};

/**
 * Hydrate Redux + localStorage after a Google OAuth round-trip.
 *
 * Two inputs off window.location.search:
 *  - ?error=<msg>   toast + strip param, no nav
 *  - ?auth=success  cookie path: GET /auth/me via HttpOnly cookie,
 *                   populate Redux user/role/isAuthenticated only.
 *                   Tokens intentionally NOT persisted client-side for
 *                   OAuth users (HttpOnly cookie is the only store).
 *
 * Identity is never read from the URL. Anyone can craft a link, so a token or
 * user in the query (e.g. a `data` param) would let an attacker sign a victim
 * into the attacker's account. Every query param is stripped either way.
 */
export const useOAuthHydration = (opts: Options = {}) => {
    const {
        redirectOnSuccess = '/dashboard',
        redirectOnFailure = '/login',
        showToastOnSuccess = true,
    } = opts;

    const { login, updateAuthData } = useAuth();
    const { setUserData } = useUser();
    const navigate = useNavigate();
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;

        const params = new URLSearchParams(window.location.search);
        const authStatus = params.get('auth');
        const errorParam = params.get('error');
        // Set by the backend Google callback: `new=1` for a just-created account,
        // `next` for the funnel post-auth destination (only when Funnel V2 is on).
        const isNewGoogleUser = params.get('new') === '1';
        const successPath = isFunnelV2Enabled()
            ? safePostAuthPath(params.get('next'), redirectOnSuccess)
            : redirectOnSuccess;
        const trackGoogleAuth = () => {
            track(isNewGoogleUser ? 'signup_completed' : 'login_completed', { method: 'google' });
        };

        if (!authStatus && !errorParam) return;
        ran.current = true;

        const stripQuery = () => {
            window.history.replaceState({}, document.title, window.location.pathname);
        };

        if (errorParam) {
            ErrorNotification(decodeURIComponent(errorParam));
            stripQuery();
            return;
        }

        if (authStatus !== 'success') {
            stripQuery();
            return;
        }

        const mapUser = (u: any) => ({
            id: u?._id || u?.id,
            name: u?.name,
            email: u?.email,
            avatar: u?.avatar,
            preferences: u?.preferences || {},
        });

        const hydrateViaCookie = async () => {
            // Drop any token already in the browser first: the backend prefers a Bearer header over the
            // cookie, so a stale (or planted) token would make /auth/me answer for that account.
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            updateAuthData({ token: '', role: null, user: null });
            const res = await Axios.get<{ data: { user: any } }>('/auth/me');
            const user = res.data?.data?.user;
            if (!user || !user.role) {
                throw new Error('Missing user or role in /auth/me response');
            }
            const mapped = mapUser(user);
            login(true);
            updateAuthData({
                token: '',
                role: user.role,
                user: mapped,
            });
            setUserData(mapped);
            localStorage.setItem('auth_role', user.role);
            localStorage.setItem('auth_user', JSON.stringify(mapped));
            localStorage.setItem('auth_is_authenticated', 'true');
        };

        (async () => {
            try {
                await hydrateViaCookie();
                trackGoogleAuth();
                stripQuery();
                if (showToastOnSuccess) SuccessNotification('Login successful!');
                navigate(successPath, { replace: true });
            } catch (e) {
                console.error('[OAuth] cookie hydration failed', e);
                ErrorNotification('Login failed. Please try again.');
                stripQuery();
                navigate(redirectOnFailure, { replace: true });
            }
        })();
    }, [login, updateAuthData, setUserData, navigate, redirectOnSuccess, redirectOnFailure, showToastOnSuccess]);
};
