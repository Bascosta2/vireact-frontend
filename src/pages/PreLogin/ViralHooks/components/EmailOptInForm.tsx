import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { subscribeEmail } from '@/api/subscribe';
import { EMAIL_REGEX } from '@/constants';

interface EmailOptInFormProps {
    /** Distinguishes the above-fold form from the bottom-of-page repeat so each
     *  has a stable id for labels / autofill / analytics if added later. */
    formId: 'top' | 'bottom';
}

/**
 * Single-field email opt-in used twice on /viral-hooks (above the fold and at
 * the bottom of the page). Posts to /api/subscribe, then redirects to
 * /viral-hooks/thank-you on success. Inline error on failure — never
 * redirects on failure.
 *
 * Visual styling mirrors the homepage hero's "Drop a YouTube Shorts Link"
 * input + orange-gradient "Sign up - It's FREE" button so the page feels
 * native to the rest of the site.
 */
function EmailOptInForm({ formId }: EmailOptInFormProps) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setError(null);

        const trimmed = email.trim();
        if (!EMAIL_REGEX.test(trimmed)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await subscribeEmail(trimmed);
            if (res?.success) {
                navigate('/viral-hooks/thank-you');
                return;
            }
            setError('Something went wrong. Try again in a moment.');
        } catch (err) {
            console.error('[viral-hooks] subscribe failed', err);
            setError('Something went wrong. Try again in a moment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputId = `viral-hooks-email-${formId}`;

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            noValidate
        >
            <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-3 px-4">
                <div className="relative flex-1 w-full">
                    <label htmlFor={inputId} className="sr-only">
                        Email address
                    </label>
                    <input
                        id={inputId}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError(null);
                        }}
                        placeholder="your@email.com"
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : `${inputId}-help`}
                        className="w-full h-[60px] pl-5 pr-5 rounded-xl bg-gray-900/80 border-2 border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] text-sm sm:text-base transition-all duration-300"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary btn-primary-hero-nav relative overflow-hidden h-[60px] px-6 sm:px-8 whitespace-nowrap disabled:opacity-70"
                    aria-label="Send me the guide"
                >
                    {isSubmitting ? 'Sending…' : 'Send me the guide'}
                </button>
            </div>
            <div className="px-4 mt-3">
                {error ? (
                    <p
                        id={`${inputId}-error`}
                        role="alert"
                        className="text-sm text-[#FF6B6B]"
                    >
                        {error}
                    </p>
                ) : (
                    <p id={`${inputId}-help`} className="text-xs text-gray-500">
                        No spam. Unsubscribe anytime.
                    </p>
                )}
            </div>
        </motion.form>
    );
}

export default EmailOptInForm;
