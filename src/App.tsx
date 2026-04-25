import { BrowserRouter } from "react-router-dom"
import { useEffect } from "react"
import BaseRoutes from '@/routes/index.tsx'
import { store } from "@/redux/store"
import { Provider } from "react-redux"
import { Toaster } from "react-hot-toast"
// import { StateInitializer } from "@/components/StateInitializer"
import { setupAuthInterceptors } from "@/utils/authInterceptor"
import ScrollToTop from "@/utils/ScrollToTop"
import { VITE_BACKEND_URL } from "@/constants"
import { useAuth } from "@/redux/hooks/use-auth"
import { useSubscription } from "@/redux/hooks/use-subscription"

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