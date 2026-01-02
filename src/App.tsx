import { BrowserRouter } from "react-router-dom"
import BaseRoutes from '@/routes/index.tsx'
import { store } from "@/redux/store"
import { Provider } from "react-redux"
import { Toaster } from "react-hot-toast"
// import { StateInitializer } from "@/components/StateInitializer"
import { setupAuthInterceptors } from "@/utils/authInterceptor"
import ScrollToTop from "@/utils/ScrollToTop"

// Setup auth interceptors
setupAuthInterceptors()

function App() {
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