import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/redux/hooks/use-auth';
import { useUser } from '@/redux/hooks/use-user';
import Axios from '@/api';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';

type Options = {
    redirectOnSuccess?: string;
    redirectOnFailure?: string;
    showToastOnSuccess?: boolean;
};

/**
 * Hydrate Redux + localStorage after a Google OAuth round-trip.
 *
 * Three inputs off window.location.search:
 *  - ?error=<msg>        toast + strip param, no nav
 *  - ?auth=success&data= legacy inline path: decode tokens + user, persist
 *                        (kept for future inline-token flows; backend does not
 *                         currently emit `data`)
 *  - ?auth=success       cookie path: GET /auth/me via HttpOnly cookie,
 *                        populate Redux user/role/isAuthenticated only.
 *                        Tokens intentionally NOT persisted client-side for
 *                        OAuth users (HttpOnly cookie is the only store).
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
        const dataParam = params.get('data');
        const errorParam = params.get('error');

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

        const hydrateLegacy = () => {
            if (!dataParam) return false;
            try {
                const decoded = JSON.parse(decodeURIComponent(dataParam));
                if (!decoded?.user?.role) return false;
                const mapped = mapUser(decoded.user);
                login(true);
                updateAuthData({
                    token: decoded.accessToken,
                    refreshToken: decoded.refreshToken || '',
                    role: decoded.user.role,
                    user: mapped,
                });
                setUserData(mapped);
                if (decoded.accessToken) {
                    localStorage.setItem('accessToken', decoded.accessToken);
                }
                if (decoded.refreshToken) {
                    localStorage.setItem('refreshToken', decoded.refreshToken);
                }
                localStorage.setItem('auth_role', decoded.user.role);
                localStorage.setItem('auth_user', JSON.stringify(mapped));
                localStorage.setItem('auth_is_authenticated', 'true');
                return true;
            } catch (e) {
                console.error('[OAuth] failed to decode data param', e);
                return false;
            }
        };

        const hydrateViaCookie = async () => {
            const res = await Axios.get<{ data: { user: any } }>('/auth/me');
            const user = res.data?.data?.user;
            if (!user || !user.role) {
                throw new Error('Missing user or role in /auth/me response');
            }
            const mapped = mapUser(user);
            login(true);
            updateAuthData({
                token: '',
                refreshToken: '',
                role: user.role,
                user: mapped,
            });
            setUserData(mapped);
            localStorage.setItem('auth_role', user.role);
            localStorage.setItem('auth_user', JSON.stringify(mapped));
            localStorage.setItem('auth_is_authenticated', 'true');
            // Defensive cleanup: OAuth users must never have JS-readable tokens.
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        };

        (async () => {
            if (hydrateLegacy()) {
                stripQuery();
                if (showToastOnSuccess) SuccessNotification('Login successful!');
                navigate(redirectOnSuccess, { replace: true });
                return;
            }
            try {
                await hydrateViaCookie();
                stripQuery();
                if (showToastOnSuccess) SuccessNotification('Login successful!');
                navigate(redirectOnSuccess, { replace: true });
            } catch (e) {
                console.error('[OAuth] cookie hydration failed', e);
                ErrorNotification('Login failed. Please try again.');
                stripQuery();
                navigate(redirectOnFailure, { replace: true });
            }
        })();
    }, [login, updateAuthData, setUserData, navigate, redirectOnSuccess, redirectOnFailure, showToastOnSuccess]);
};
