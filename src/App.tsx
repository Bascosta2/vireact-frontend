import { BrowserRouter } from "react-router-dom"
import { useEffect } from "react"
import BaseRoutes from '@/routes/index.tsx'
import { store } from "@/redux/store"
import { Provider } from "react-redux"
import { Toaster } from "react-hot-toast"
// import { StateInitializer } from "@/components/StateInitializer"
import { setupAuthInterceptors } from "@/utils/authInterceptor"
import ScrollToTop from "@/utils/ScrollToTop"
import Axios from "@/api"
import { VITE_BACKEND_URL } from "@/constants"

// Setup auth interceptors
setupAuthInterceptors()

// Startup connectivity test
const testBackendConnection = async () => {
  if (import.meta.env.DEV) {
    try {
      // Test via Axios (uses proxy in dev, full URL in prod)
      const axiosResponse = await Axios.get('/health');
      console.log('✅ [STARTUP] Backend connection successful:', axiosResponse.data);
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