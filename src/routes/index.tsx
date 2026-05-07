import { Suspense } from 'react'
import Fallback from '@/components/Fallback'
import RouteErrorBoundary from '@/components/RouteErrorBoundary'
import { useAuth } from '@/redux/hooks/use-auth'
import ProtectedRoutes from './ProtectedRoutes'
import PublicRoutes from './PublicRoutes'
import PreLoginHeader from '@/components/Header/PreLoginHeader'
import Footer from '@/components/Footer'

const BaseRoutes = () => {
  const { isAuthenticated } = useAuth()
  // const isAuthenticated = import.meta.env.VITE_IS_AUTHENTICATED === 'true'
  return (

    <>
      <div
        className="">
        <RouteErrorBoundary>
          <Suspense fallback={<Fallback />}>
            {
              isAuthenticated ?
                <>
                  <ProtectedRoutes />
                </>

                :

                <>
                  <PreLoginHeader />
                  <PublicRoutes />
                  <Footer />
                </>

            }
          </Suspense>
        </RouteErrorBoundary>
      </div>

    </>
  )
}
export default BaseRoutes