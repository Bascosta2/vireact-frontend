import GoogleOneTap from '@/components/GoogleOneTap';
import CustomSignupForm from '@/components/CustomSignupForm';
import { ErrorNotification } from '@/utils/toast';
import { Link } from 'react-router-dom';
import { useOAuthHydration } from '@/redux/hooks/use-oauth-hydration';




function SignupForm() {

    // Hydrate Redux/localStorage from a Google OAuth redirect (?auth=success, ?error=…).
    // Central implementation lives in use-oauth-hydration.
    useOAuthHydration({ redirectOnSuccess: '/dashboard' });
    
    const handleGoogleSuccess = () => {
        console.log('Google authentication initiated');
    };
    
    const handleGoogleError = (error: string) => {
        console.error('Google authentication error:', error);
        ErrorNotification('Google authentication failed. Please try again.');
    };
    
    const handleFormSuccess = () => {
        console.log('Signup successful');
    };
    
    const handleFormError = (error: string) => {
        console.error('Signup error:', error);
        ErrorNotification(error);
    };
    

  return (
    <div className="bg-dark-primary flex flex-col justify-center px-6 sm:px-12 py-16 rounded-lg">
    {/* Main Heading */}
    <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
            Finish signing up to get started
        </h1>
    </div>

    {/* Google Authentication */}
    <div className="mb-6">
        <GoogleOneTap
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            buttonText="Continue with Google"
        />
    </div>

    {/* Divider */}
    <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
            <span className="text-white font-medium px-4 bg-dark-primary">or continue with email</span>
        </div>
    </div>

    {/* Custom Signup Form */}
    <div className="mb-6">
        <CustomSignupForm
            isLogin={false}
            onSuccess={handleFormSuccess}
            onError={handleFormError}
        />
    </div>

    {/* Login Link */}
    <div className="text-center">
        <p className="text-sm text-white">
            Already have an account?{' '}
            <Link to="/login" className="underline hover:no-underline">
                Log in
            </Link>
        </p>
    </div>
</div>
  )
}

export default SignupForm