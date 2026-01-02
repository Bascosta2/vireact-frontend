import { store } from '@/redux/store';
import { logout, setAuthData } from '@/redux/slices/auth-slice';
import Axios from '@/api';
import { AUTH_TOKEN } from '@/constants';

/**
 * Setup Axios interceptors for automatic authentication handling
 */
export const setupAuthInterceptors = () => {
  // Request interceptor to add auth token
  Axios.interceptors.request.use(
    (config) => {
      const token = store.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 errors and token refresh
  Axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      // Handle 401 Unauthorized responses
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const refreshToken = store.getState().auth.refreshToken;
        
        if (refreshToken) {
          try {
            // Attempt to refresh the token
            const response = await Axios.post('/auth/refresh-token', {
              refreshToken
            });
            
            if (response.data.success) {
              const { accessToken, refreshToken: newRefreshToken } = response.data.data;
              
              // Update Redux state
              store.dispatch(setAuthData({
                token: accessToken,
                refreshToken: newRefreshToken,
                role: store.getState().auth.role,
                user: store.getState().auth.user
              }));
              
              // Update localStorage
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return Axios(originalRequest);
            }
          } catch (refreshError) {
            console.warn('Token refresh failed, clearing authentication');
          }
        }
        
        // If refresh fails or no refresh token, clear authentication
        console.warn('Unauthorized access detected, clearing authentication');
        
        // Clear Redux state
        store.dispatch(logout());
        
        // Clear localStorage
        localStorage.removeItem(AUTH_TOKEN);
        localStorage.removeItem('refreshToken');
        
        // Redirect to login page (only if not already on login page)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
};

/**
 * Remove all interceptors (useful for cleanup)
 */
export const clearAuthInterceptors = () => {
  Axios.interceptors.request.clear();
  Axios.interceptors.response.clear();
};
