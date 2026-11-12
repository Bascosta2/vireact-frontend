import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import Fallback from "@/components/Fallback";

// Module-scope lazy() so each render reuses the same component identities;
// inline declarations would create a new component type per render, causing
// the matched route subtree to remount and Suspense to re-trigger.
const Dashboard = lazy(() => import('@/pages/User/Dashboard'));
const NewAnalysis = lazy(() => import('@/pages/User/NewAnalysis'));
const Analytics = lazy(() => import('@/pages/User/Analytics'));
const Editor = lazy(() => import('@/pages/User/Editor'));
const EditProject = lazy(() => import('@/pages/User/Editor/ProjectPage'));
const Videos = lazy(() => import('@/pages/User/Videos'));
const Chat = lazy(() => import('@/pages/User/Chat'));
const Profile = lazy(() => import('@/pages/User/Profile'));
const SubscriptionUsage = lazy(() => import('@/pages/User/SubscriptionUsage'));
const SubscriptionPlans = lazy(() => import('@/pages/User/SubscriptionPlans'));
const ResetPassword = lazy(() => import('@/pages/PreLogin/ResetPassword'));

/** Old upload steps now live on /new; query params (e.g. ?onboarding=1) carry over. */
function RedirectKeepingQuery({ to }: { to: string }) {
    const { search, hash } = useLocation();
    return <Navigate to={`${to}${search}${hash}`} replace />;
}

function UserRoutes() {
    return (
        <Suspense fallback={<Fallback />}>
            <Routes>
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/new' element={<NewAnalysis />} />
                <Route path='/upload' element={<RedirectKeepingQuery to="/new" />} />
                <Route path='/features' element={<RedirectKeepingQuery to="/new" />} />
                <Route path='/analytics' element={<Analytics />} />
                <Route path='/editor' element={<Editor />} />
                <Route path='/editor/:projectId' element={<EditProject />} />
                <Route path='/videos' element={<Videos />} />
                <Route path='/videos/:videoId' element={<Chat />} />
                <Route path='/settings' element={<Profile />} />
                <Route path='/profile' element={<RedirectKeepingQuery to="/settings" />} />
                <Route path='/subscription-usage' element={<SubscriptionUsage />} />
                <Route path='/subscription-plans' element={<SubscriptionPlans />} />
                <Route path='/' element={<Navigate to="/dashboard" />} />
                <Route path='*' element={<Navigate to="/dashboard" />} />
            </Routes>
        </Suspense>
    )
}

export default UserRoutes
