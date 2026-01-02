import { useAuth } from '@/redux/hooks/use-auth';
import { useUser } from '@/redux/hooks/use-user';
import { useAdmin } from '@/redux/hooks/use-admin';
import Axios from '@/api';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';

export const useLogout = () => {
    const { logout: logoutAuth, role } = useAuth();
    const { clearUserData } = useUser();
    const { clearAdminData } = useAdmin();

    const logout = async () => {
        try {
            // Make API call to logout
            await Axios.post('/auth/logout', {
                role: role || 'user'
            });

            // Clear frontend state
            logoutAuth();
            clearUserData();
            clearAdminData();

            // Clear localStorage
            localStorage.removeItem('auth_is_authenticated');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('auth_role');
            localStorage.removeItem('auth_user');

            SuccessNotification('Logged out successfully!');
            
            // Redirect to login page
            window.location.href = '/login';
        } catch (error: any) {
            console.error('Logout error:', error);
            
            // Even if API call fails, still logout from frontend
            logoutAuth();
            clearUserData();
            clearAdminData();

            // Clear localStorage
            localStorage.removeItem('auth_is_authenticated');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('auth_role');
            localStorage.removeItem('auth_user');

            const errorMessage = error.response?.data?.message || 'Logout failed, but you have been logged out locally';
            ErrorNotification(errorMessage);
            
            // Redirect to login page
            window.location.href = '/login';
        }
    };

    return { logout };
};
