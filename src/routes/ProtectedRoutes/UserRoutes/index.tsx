import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom"
import Features from '@/pages/Features'
import Fallback from "@/components/Fallback";

// Module-scope lazy() so each render reuses the same component identities;
// inline declarations would create a new component type per render, causing
// the matched route subtree to remount and Suspense to re-trigger.
const Dashboard = lazy(() => import('@/pages/User/Dashboard'));
const Upload = lazy(() => import('@/pages/User/Upload'));
const Analytics = lazy(() => import('@/pages/User/Analytics'));
const Videos = lazy(() => import('@/pages/User/Videos'));
const Chat = lazy(() => import('@/pages/User/Chat'));
const Profile = lazy(() => import('@/pages/User/Profile'));
const Settings = lazy(() => import('@/pages/User/Settings'));
const SubscriptionUsage = lazy(() => import('@/pages/User/SubscriptionUsage'));
const SubscriptionPlans = lazy(() => import('@/pages/User/SubscriptionPlans'));

function UserRoutes() {
    return (
        <Suspense fallback={<Fallback />}>
            <Routes>
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/upload' element={<Upload />} />
                <Route path='/features' element={<Features />} />
                <Route path='/analytics' element={<Analytics />} />
                <Route path='/videos' element={<Videos />} />
                <Route path='/videos/:videoId' element={<Chat />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/settings' element={<Settings />} />
                <Route path='/subscription-usage' element={<SubscriptionUsage />} />
                <Route path='/subscription-plans' element={<SubscriptionPlans />} />
                <Route path='/' element={<Navigate to="/dashboard" />} />
                <Route path='*' element={<Navigate to="/dashboard" />} />
            </Routes>
        </Suspense>
    )
}

export default UserRoutes