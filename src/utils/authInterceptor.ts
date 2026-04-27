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
  // The refresh token lives only in an HttpOnly cookie set by the backend.
  // Axios is configured with withCredentials: true (see api/index.ts) so the
  // cookie is sent automatically on every same-site/CORS request. We send no
  // body — the backend controller resolves the token from req.cookies.
  // The new accessToken is returned in the JSON body and stored for Bearer
  // header use; refresh-token rotation happens server-side via Set-Cookie.
  Axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }

      // Hard stop: a 401 on the refresh call itself means the refresh cookie
      // is invalid/expired. Do not loop.
      const url: string = originalRequest?.url || '';
      if (url.endsWith('/auth/refresh-token')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const response = await Axios.post('/auth/refresh-token');

        if (response.data?.success) {
          const { accessToken } = response.data.data || {};

          if (accessToken) {
            store.dispatch(setAuthData({
              token: accessToken,
              role: store.getState().auth.role,
              user: store.getState().auth.user
            }));
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return Axios(originalRequest);
        }
      } catch (refreshError) {
        console.warn('Token refresh failed, clearing authentication');
      }

      // Refresh failed — clear whatever client-side auth remnants exist.
      // localStorage refreshToken removal is legacy cleanup for sessions
      // established before client-side refresh-token storage was removed.
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
