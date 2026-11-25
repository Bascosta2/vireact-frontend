import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import Fallback from "@/components/Fallback";
import { useEditorAccess } from "@/lib/editor-access";
import { useAccountsAccess } from "@/lib/accounts-access";

// Module-scope lazy() so each render reuses the same component identities;
// inline declarations would create a new component type per render, causing
// the matched route subtree to remount and Suspense to re-trigger.
const Dashboard = lazy(() => import('@/pages/User/Dashboard'));
const NewAnalysis = lazy(() => import('@/pages/User/NewAnalysis'));
const Analytics = lazy(() => import('@/pages/User/Analytics'));
const Editor = lazy(() => import('@/pages/User/Editor'));
const EditProject = lazy(() => import('@/pages/User/Editor/ProjectPage'));
const Accounts = lazy(() => import('@/pages/User/Accounts'));
const SkillsEditor = lazy(() => import('@/pages/User/Skills'));
const Videos = lazy(() => import('@/pages/User/Videos'));
const Chat = lazy(() => import('@/pages/User/Chat'));
const VideoHub = lazy(() => import('@/pages/User/VideoHub'));
const Profile = lazy(() => import('@/pages/User/Profile'));
const SubscriptionUsage = lazy(() => import('@/pages/User/SubscriptionUsage'));
const SubscriptionPlans = lazy(() => import('@/pages/User/SubscriptionPlans'));
const Trial = lazy(() => import('@/pages/User/Trial'));
const ResetPassword = lazy(() => import('@/pages/PreLogin/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/PreLogin/VerifyEmail'));

/** Old upload steps now live on /new; query params (e.g. ?onboarding=1) carry over. */
function RedirectKeepingQuery({ to }: { to: string }) {
    const { search, hash } = useLocation();
    return <Navigate to={`${to}${search}${hash}`} replace />;
}

/** Editor private beta: accounts without access are sent Home, and never download the editor code. */
function EditorGate({ children }: { children: ReactNode }) {
    const access = useEditorAccess();
    if (access === 'loading') return <Fallback />;
    if (access === 'denied') return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

/** Accounts tab private beta: same gate as the editor. */
function AccountsGate({ children }: { children: ReactNode }) {
    const access = useAccountsAccess();
    if (access === 'loading') return <Fallback />;
    if (access === 'denied') return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

function UserRoutes() {
    return (
        <Suspense fallback={<Fallback />}>
            <Routes>
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                {/* Verification links also work for signed-in users (otherwise the catch-all would drop the token). */}
                <Route path='/verify-email' element={<VerifyEmail />} />
                <Route path='/new' element={<NewAnalysis />} />
                <Route path='/upload' element={<RedirectKeepingQuery to="/new" />} />
                <Route path='/features' element={<RedirectKeepingQuery to="/new" />} />
                <Route path='/analytics' element={<Analytics />} />
                <Route path='/editor' element={<EditorGate><Editor /></EditorGate>} />
                <Route path='/editor/:projectId' element={<EditorGate><EditProject /></EditorGate>} />
                <Route path='/skills' element={<EditorGate><SkillsEditor /></EditorGate>} />
                <Route path='/skills/:projectId' element={<EditorGate><EditProject /></EditorGate>} />
                <Route path='/accounts' element={<AccountsGate><Accounts /></AccountsGate>} />
                <Route path='/videos' element={<Videos />} />
                {/* One video, three views: Feedback Report (default), /coach and /scripts. */}
                <Route path='/videos/:videoId/:view?' element={<Chat />} />
                {/* Sidebar entries: open that view on the last or newest analysed video, or show a sample. */}
                <Route path='/reports' element={<VideoHub view="report" />} />
                <Route path='/coach' element={<VideoHub view="coach" />} />
                <Route path='/scripts' element={<VideoHub view="scripts" />} />
                <Route path='/settings' element={<Profile />} />
                <Route path='/profile' element={<RedirectKeepingQuery to="/settings" />} />
                <Route path='/subscription-usage' element={<SubscriptionUsage />} />
                <Route path='/subscription-plans' element={<SubscriptionPlans />} />
                <Route path='/trial' element={<Trial />} />
                <Route path='/' element={<Navigate to="/dashboard" />} />
                <Route path='*' element={<Navigate to="/dashboard" />} />
            </Routes>
        </Suspense>
    )
}

export default UserRoutes
