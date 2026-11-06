import { store } from '@/redux/store';
import { logout, setAuthData } from '@/redux/slices/auth-slice';
import Axios from '@/api';
import { AUTH_TOKEN } from '@/constants';

/**
 * One refresh at a time. When the access token expires, the app usually has several requests in
 * flight (dashboard loads subscription + videos together). Each used to start its own refresh; the
 * server rotates the token on the first, so the others presented a stale token, failed, and the user
 * was logged out. Now every 401 waits on the same refresh.
 */
let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshInFlight) {
    refreshInFlight = Axios.post('/auth/refresh-token')
      .then((response) => {
        if (!response.data?.success) throw new Error('Refresh rejected');
        const { accessToken } = response.data.data || {};
        if (accessToken) {
          store.dispatch(setAuthData({
            token: accessToken,
            role: store.getState().auth.role,
            user: store.getState().auth.user
          }));
          localStorage.setItem('accessToken', accessToken);
        }
        return accessToken ?? null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

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

      // Not signed in (e.g. a visitor on a public page): nothing to refresh, never redirect.
      if (!store.getState().auth.isAuthenticated) {
        return Promise.reject(error);
      }

      try {
        const accessToken = await refreshAccessToken();
        if (accessToken) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return Axios(originalRequest);
      } catch {
        console.warn('Token refresh failed, clearing authentication');
      }

      // Refresh failed — clear whatever client-side auth remnants exist.
      // localStorage refreshToken removal is legacy cleanup for sessions
      // established before client-side refresh-token storage was removed.
      console.warn('Unauthorized access detected, clearing authentication');
      store.dispatch(logout());
      localStorage.removeItem(AUTH_TOKEN);
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth_is_authenticated');
      localStorage.removeItem('auth_role');
      localStorage.removeItem('auth_user');

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
