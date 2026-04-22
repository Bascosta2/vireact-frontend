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

  // Response interceptor to handle 401 errors and token refresh.
  // Supports two user populations:
  //   1. Form users   — Redux has refreshToken, send it in the body.
  //   2. OAuth users  — Redux has no refreshToken, rely on the HttpOnly
  //                     refresh cookie (sent automatically via withCredentials).
  // Backend controller reads body first, then cookie.
  Axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }

      // Hard stop: a 401 on the refresh call itself means the refresh token
      // (body or cookie) is invalid/expired. Do not loop.
      const url: string = originalRequest?.url || '';
      if (url.endsWith('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const hadReduxRefresh = !!store.getState().auth.refreshToken;

      try {
        const body = hadReduxRefresh
          ? { refreshToken: store.getState().auth.refreshToken }
          : {};
        const response = await Axios.post('/auth/refresh-token', body);

        if (response.data?.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data || {};

          // Only persist tokens client-side for form users who already had them.
          // OAuth users keep tokens in HttpOnly cookies only; the backend just
          // re-issued Set-Cookie headers on the refresh response.
          if (hadReduxRefresh) {
            store.dispatch(setAuthData({
              token: accessToken,
              refreshToken: newRefreshToken,
              role: store.getState().auth.role,
              user: store.getState().auth.user
            }));
            if (accessToken) localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          // For OAuth users the request will resend via withCredentials and
          // pick up the fresh accessToken cookie automatically.
          return Axios(originalRequest);
        }
      } catch (refreshError) {
        console.warn('Token refresh failed, clearing authentication');
      }

      // Refresh failed — clear whatever client-side auth remnants exist.
      console.warn('Unauthorized access detected, clearing authentication');
      store.dispatch(logout());
      localStorage.removeItem(AUTH_TOKEN);
      localStorage.removeItem('refreshToken');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
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
