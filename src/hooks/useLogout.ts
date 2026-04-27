import { useAuth } from '@/redux/hooks/use-auth';
import { useUser } from '@/redux/hooks/use-user';
import { useAdmin } from '@/redux/hooks/use-admin';
import { useSubscription } from '@/redux/hooks/use-subscription';
import Axios from '@/api';
import { SuccessNotification } from '@/utils/toast';

export const useLogout = () => {
    const { logout: logoutAuth, role } = useAuth();
    const { clearUserData } = useUser();
    const { clearAdminData } = useAdmin();
    const { clear: clearSubscription } = useSubscription();

    const logout = async () => {
        // Server-side revocation. The backend gates POST /auth/logout behind
        // authenticateToken (commit 0837232), so a client whose access token
        // has already expired will receive 401 here. From the user's POV they
        // are still logged out — we proceed with local cleanup unconditionally.
        // Other server errors (network failure, 5xx) are also non-fatal: the
        // worst case is the persisted refresh token isn't revoked, but the
        // access token expires within 30 minutes regardless.
        try {
            await Axios.post('/auth/logout', { role: role || 'user' });
        } catch (error: any) {
            if (error?.response?.status !== 401) {
                console.warn(
                    'Logout server call failed; clearing local state anyway:',
                    error
                );
            }
        }

        // Clear frontend state. Auth FIRST so subscription-dependent
        // components see isAuthenticated:false and unmount before
        // re-rendering against an empty subscription slice.
        logoutAuth();
        clearUserData();
        clearAdminData();
        clearSubscription();

        // Clear localStorage. The auth-slice logout reducer also clears these
        // plus 'refreshToken' (legacy); duplication here is harmless and keeps
        // local cleanup independent of the slice reducer ordering.
        localStorage.removeItem('auth_is_authenticated');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth_role');
        localStorage.removeItem('auth_user');

        SuccessNotification('Logged out successfully!');
        window.location.href = '/login';
    };

    return { logout };
};
