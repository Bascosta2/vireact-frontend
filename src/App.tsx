import { BrowserRouter, useLocation } from "react-router-dom"
import { useEffect } from "react"
import BaseRoutes from '@/routes/index.tsx'
import { store, type RootState } from "@/redux/store"
import { Provider, useSelector } from "react-redux"
import { Toaster } from "react-hot-toast"
// import { StateInitializer } from "@/components/StateInitializer"
import { setupAuthInterceptors } from "@/utils/authInterceptor"
import ScrollToTop from "@/utils/ScrollToTop"
import { VITE_BACKEND_URL } from "@/constants"
import { useAuth } from "@/redux/hooks/use-auth"
import { useSubscription } from "@/redux/hooks/use-subscription"
import { alias, identify, page } from "@/lib/analytics"
import { getAttribution } from "@/funnel/attribution"
import { isFunnelV2Enabled } from "@/funnel/cta"
import { getFunnelSessionId, markAliased } from "@/funnel/session"
import Axios from "@/api"

// Setup auth interceptors
setupAuthInterceptors()

// Startup connectivity test
const testBackendConnection = async () => {
  if (import.meta.env.DEV) {
    try {
      // /api/health matches backend app.js and Vite proxy `/api` → backend
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('✅ [STARTUP] Backend connection successful:', data);
    } catch (error: any) {
      console.warn('⚠️ [STARTUP] Backend connection test failed:', error.message);
      if (VITE_BACKEND_URL) {
        console.warn('   Make sure the backend server is running on', VITE_BACKEND_URL);
        console.warn('   Expected endpoint: /api/health (via Vite proxy)');
      } else {
        console.warn('   VITE_BACKEND_URL is not configured, using Vite proxy');
        console.warn(
          '   Ensure the local backend matches vite.config.ts proxy target (default http://localhost:5000).'
        );
      }
    }
  }
};

/**
 * Mount-time bootstrap that fetches the user's subscription into Redux once
 * authenticated. Lives inside <Provider> so it can use useSelector/useDispatch.
 * Renders nothing — its only job is to own the mount effect.
 *
 * The thunk's own `condition` callback dedupes if status !== 'idle'; the
 * status guard here is belt-and-suspenders for StrictMode double-mount.
 */
const SubscriptionBootstrap = () => {
  const { isAuthenticated } = useAuth();
  const { ensureLoaded, status } = useSubscription();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (status !== "idle") return;
    ensureLoaded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, status]);

  return null;
};

const ATTRIBUTION_SYNCED_KEY = "vireact_attribution_synced";

const AnalyticsIdentity = () => {
  const { isAuthenticated, role } = useAuth();
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    identify(userId);

    // Merge the anonymous quiz session's events into this user (once per session id).
    const funnelSessionId = isFunnelV2Enabled() && role === "user" ? getFunnelSessionId() : null;
    if (funnelSessionId && markAliased(funnelSessionId)) alias(funnelSessionId);

    // Covers Google OAuth signups; the backend only writes if nothing is stored yet.
    const attribution = getAttribution();
    if (role !== "user" || !attribution) return;
    if (localStorage.getItem(ATTRIBUTION_SYNCED_KEY) === userId) return;
    Axios.post("/auth/attribution", { attribution })
      .then(() => localStorage.setItem(ATTRIBUTION_SYNCED_KEY, userId))
      .catch(() => undefined);
  }, [isAuthenticated, userId, role]);

  return null;
};

const PageviewTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    page(pathname);
  }, [pathname]);
  return null;
};

function App() {
  useEffect(() => {
    // Test backend connectivity on app startup
    testBackendConnection();
  }, []);

  return (
    <>
      <BrowserRouter>
        <Provider store={store}>
          {/* <StateInitializer> */}
            <SubscriptionBootstrap />
            <AnalyticsIdentity />
            <PageviewTracker />
            <Toaster
              position="bottom-center"
              toastOptions={{ duration: 4000 }} />
            <ScrollToTop />
            <BaseRoutes />
          {/* </StateInitializer> */}
        </Provider>
      </BrowserRouter>
    </>
  )
}

export default App