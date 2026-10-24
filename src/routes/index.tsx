import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import Fallback from '@/components/Fallback'
import RouteErrorBoundary from '@/components/RouteErrorBoundary'
import { useAuth } from '@/redux/hooks/use-auth'
import ProtectedRoutes from './ProtectedRoutes'
import PublicRoutes from './PublicRoutes'
import PreLoginHeader from '@/components/Header/PreLoginHeader'
import Footer from '@/components/Footer'
import { isFunnelV2Enabled } from '@/funnel/cta'
import { isSharedPath } from './shared-paths'

const SharedRoutes = lazy(() => import('./SharedRoutes'))

const BaseRoutes = () => {
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()
  // const isAuthenticated = import.meta.env.VITE_IS_AUTHENTICATED === 'true'

  if (isFunnelV2Enabled() && isSharedPath(pathname)) {
    return (
      <RouteErrorBoundary>
        <Suspense fallback={<Fallback />}>
          <SharedRoutes />
        </Suspense>
      </RouteErrorBoundary>
    )
  }

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