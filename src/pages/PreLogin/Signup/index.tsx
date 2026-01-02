import SocialProof from '@/components/SocialProof';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import SignupForm from '@/pages/PreLogin/Signup/SignupForm';

function Signup() {


    return (
        <PreLoginPage>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 min-h-screen p-0 sm:p-12">
                {/* Left Section - Signup Form (40%) */}
                <SignupForm />
                {/* Right Section - Social Proof (60%) */}
                <SocialProof />
            </div>
        </PreLoginPage>
    )
}

export default Signup