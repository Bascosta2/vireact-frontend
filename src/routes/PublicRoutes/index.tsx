import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom"
import Fallback from "@/components/Fallback";

const Home = lazy(() => import('@/pages/PreLogin/Home'));
const Pricing = lazy(() => import('@/pages/PreLogin/Pricing'));
const Login = lazy(() => import('@/pages/PreLogin/Login'));
const Signup = lazy(() => import('@/pages/PreLogin/Signup'));
const ViralPredictor = lazy(() => import('@/pages/PreLogin/Features/ViralPredictor'));
const PacingAndRhythm = lazy(() => import('@/pages/PreLogin/Features/PacingAndRhythm'));
const CaptionClarity = lazy(() => import('@/pages/PreLogin/Features/CaptionClarity'));
const HookAnalyzer = lazy(() => import('@/pages/PreLogin/Features/HookAnalyzer'));
const AdvancedAnalytics = lazy(() => import('@/pages/PreLogin/Features/AdvancedAnalytics'));
const AudioInsight = lazy(() => import('@/pages/PreLogin/Features/AudioInsight'));
const FAQs = lazy(() => import('@/pages/PreLogin/FAQs'));
const GetInTouch = lazy(() => import('@/pages/PreLogin/GetInTouch'));
const GoogleCallback = lazy(() => import('@/components/GoogleCallback'));
const VerifyEmail = lazy(() => import('@/pages/PreLogin/VerifyEmail'));
const ResendVerification = lazy(() => import('@/pages/PreLogin/ResendVerification'));

// Trust & Legal Pages
const TermsAndConditions = lazy(() => import('@/pages/PreLogin/TrustAndLegal/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('@/pages/PreLogin/TrustAndLegal/PrivacyPolicy'));
const TermsOfServices = lazy(() => import('@/pages/PreLogin/TrustAndLegal/TermsOfServices'));
const CookiesPreferences = lazy(() => import('@/pages/PreLogin/TrustAndLegal/CookiesPreferences'));
const AccessibilityStatement = lazy(() => import('@/pages/PreLogin/TrustAndLegal/AccessibilityStatement'));

// Early Access
const EarlyAccess = lazy(() => import('@/pages/PreLogin/EarlyAccess'));

function PublicRoutes() {

    return (
        <Suspense fallback={<Fallback />}>
            <Routes>
                <Route path='*' element={<Navigate to="/" />} />
                <Route path='/' element={<Home />} />
                <Route path='/pricing' element={<Pricing />} />
                <Route path='/auth/google/callback' element={<GoogleCallback />} />
                <Route path='/login' element={<Login />} />
                <Route path='/signup' element={<Signup />} />
                <Route path='/verify-email' element={<VerifyEmail />} />
                <Route path='/resend-verification' element={<ResendVerification />} />

                {/* Features */}
                <Route path='/features/viral-predictor' element={<ViralPredictor />} />
                <Route path='/features/pacing-and-rhythm' element={<PacingAndRhythm />} />
                <Route path='/features/caption-clarity' element={<CaptionClarity />} />
                <Route path='/features/hook-analyzer' element={<HookAnalyzer />} />
                <Route path='/features/advanced-analytics' element={<AdvancedAnalytics />} />
                <Route path='/features/audio-insight' element={<AudioInsight />} />

                {/* FAQs */}
                <Route path='/frequently-asked-questions' element={<FAQs />} />
                <Route path='/get-in-touch' element={<GetInTouch />} />

                {/* Trust & Legal */}
                <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
                <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                <Route path='/terms-of-services' element={<TermsOfServices />} />
                <Route path='/cookies-preferences' element={<CookiesPreferences />} />
                <Route path='/accessibility-statement' element={<AccessibilityStatement />} />


                {/* Early Access */}
                <Route path='/early-access' element={<EarlyAccess />} />


                {/* <Route path='/fallback' element={<Fallback />} /> */}
            </Routes>
        </Suspense>
    )
}

export default PublicRoutes