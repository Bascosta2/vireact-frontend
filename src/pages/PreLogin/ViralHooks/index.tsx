import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import EmailOptInForm from './components/EmailOptInForm';
import SocialProofRow from './components/SocialProofRow';
import InsideCards from './components/InsideCards';
import PreviewSection from './components/PreviewSection';

/**
 * /viral-hooks — focused single-offer lead-gen page for the 119 Viral Hooks
 * PDF.
 *
 * Audience: pre-warmed DM traffic (users who commented "free resources" on
 * social posts) plus general site visitors via the "119 Free Hooks" nav link.
 *
 * Cold traffic still lands on the homepage, not here.
 *
 * Hard constraints embodied here (see project spec):
 *   - Email-only form (no name, no phone, no textarea).
 *   - The PDF is the only above-fold offer.
 *   - App promotion is a single below-fold soft text-link, never a button.
 *   - The exact headline is fixed.
 */
function ViralHooksPage() {
    return (
        <PreLoginPage>
            <div
                className="min-h-screen w-full max-w-[100vw] overflow-x-hidden"
                style={{
                    background:
                        'radial-gradient(ellipse 100% 35% at 50% 0%,    rgba(88, 28, 135, 0.07) 0%, transparent 60%), radial-gradient(ellipse 60%  50% at 0% 50%,    rgba(180, 20, 40, 0.07) 0%, transparent 55%), radial-gradient(ellipse 60%  50% at 100% 50%,  rgba(180, 80, 0, 0.06)  0%, transparent 55%), radial-gradient(ellipse 80%  30% at 50% 100%,  rgba(88, 28, 135, 0.06) 0%, transparent 50%), #0a0a0f',
                    backgroundAttachment: 'fixed',
                    minHeight: '100vh',
                }}
            >
                {/* Above-the-fold */}
                <section
                    className="relative overflow-hidden pb-4 max-w-[100vw]"
                    style={{ background: 'transparent' }}
                    aria-label="Free PDF offer"
                >
                    <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4 sm:pt-6 md:pt-8 lg:pt-10">
                        {/* Badge — green glow style, matches homepage hero badge */}
                        <motion.div
                            className="flex justify-center mb-4 md:mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <span
                                className="inline-block px-3 py-1 text-[11px] md:px-5 md:py-2 md:text-[13px] font-semibold uppercase tracking-wide cursor-default text-center"
                                style={{
                                    border: '1.5px solid rgba(16, 185, 129, 0.4)',
                                    color: '#4ade80',
                                    borderRadius: '9999px',
                                    backgroundColor: 'transparent',
                                    boxShadow: '0 0 15px rgba(74, 222, 128, 0.3)',
                                }}
                            >
                                FREE PDF — NO SIGN-UP, NO PAYWALL
                            </span>
                        </motion.div>

                        {/* Headline — orange-to-yellow gradient, same family as homepage */}
                        <motion.h1
                            className="text-center mb-4 md:mb-6 px-1 md:px-2 select-text cursor-text"
                            style={{ lineHeight: 1.05 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <span
                                className="inline-block font-normal text-[2rem] max-md:leading-tight md:[font-size:clamp(2rem,5vw,72px)]"
                                style={{
                                    fontFamily: 'Impact, sans-serif',
                                    fontWeight: 400,
                                    letterSpacing: '0.5px',
                                    background:
                                        'linear-gradient(90deg, #FF4757 0%, #FF6B35 50%, #FFA502 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                119 VIRAL HOOKS THAT GOT 200M+ VIEWS IN A YEAR
                            </span>
                        </motion.h1>

                        {/* Subhead */}
                        <motion.p
                            className="text-center text-gray-300 max-md:text-sm md:text-[17px] max-w-xs md:max-w-2xl mx-auto mb-6 md:mb-8 px-2 md:px-4"
                            style={{ lineHeight: 1.5 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            The exact hooks, storytelling structure, and plot-twist formula behind every short. Drops to your inbox in 10 seconds.
                        </motion.p>

                        {/* Email opt-in */}
                        <EmailOptInForm formId="top" />

                        {/* Social proof */}
                        <SocialProofRow />
                    </div>
                </section>

                {/* Three "what's inside" cards */}
                <InsideCards />

                {/* PDF preview */}
                <PreviewSection />

                {/* Soft app bridge — single text-link line, NOT a button */}
                <section
                    className="relative w-full px-4 py-8 md:py-12"
                    style={{ background: 'transparent' }}
                    aria-label="Vireact app mention"
                >
                    <p className="max-w-3xl mx-auto text-center text-sm md:text-base text-gray-400 leading-relaxed">
                        Want the framework applied automatically? Vireact scores your videos against this exact structure.{' '}
                        <Link
                            to="/"
                            className="text-gray-200 underline underline-offset-4 decoration-gray-500 hover:text-white hover:decoration-white transition-colors"
                        >
                            See how it works →
                        </Link>
                    </p>
                </section>

                {/* Bottom CTA repeat — same form, same styling */}
                <section
                    className="relative w-full px-4 pt-4 pb-16 md:pb-24"
                    style={{ background: 'transparent' }}
                    aria-label="Get the PDF — bottom"
                >
                    <div className="max-w-3xl mx-auto text-center mb-6">
                        <h2
                            className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight"
                            style={{ letterSpacing: '-0.02em' }}
                        >
                            Get the PDF now
                        </h2>
                        <p className="text-sm text-gray-400 mt-2">
                            Drops to your inbox in 10 seconds.
                        </p>
                    </div>
                    <EmailOptInForm formId="bottom" />
                </section>
            </div>
        </PreLoginPage>
    );
}

export default ViralHooksPage;
