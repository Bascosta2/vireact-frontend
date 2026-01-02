import SocialProof from '@/components/SocialProof';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import LoginForm from '@/pages/PreLogin/Login/LoginForm';

function Login() {
   

    return (
        <PreLoginPage>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 min-h-screen p-0 sm:p-12">
                {/* Left Section - Login Form */}
                <LoginForm />

                {/* Right Section - Social Proof (60%) */}
                <SocialProof />
            </div>
        </PreLoginPage>
    )
}

export default Login