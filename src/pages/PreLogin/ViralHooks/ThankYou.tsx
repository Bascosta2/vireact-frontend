import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import PreLoginPage from '@/components/Layout/PreLoginPage';

/**
 * /viral-hooks/thank-you
 *
 * Rendered after a successful POST to /api/subscribe. This is the ONLY place
 * in the entire PDF funnel where the Vireact app is hard-pitched — the
 * `/viral-hooks` page itself keeps the app mention to a single below-fold
 * text link by design.
 */
function ViralHooksThankYouPage() {
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
                {/* Confirmation block */}
                <section
                    className="relative max-w-3xl mx-auto px-4 pt-8 md:pt-16 pb-8 md:pb-12 text-center"
                    style={{ background: 'transparent' }}
                    aria-label="Submission confirmed"
                >
                    <motion.div
                        className="flex justify-center mb-5 md:mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <span
                            className="inline-block px-3 py-1 text-[11px] md:px-5 md:py-2 md:text-[13px] font-semibold uppercase tracking-wide cursor-default"
                            style={{
                                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                                color: '#4ade80',
                                borderRadius: '9999px',
                                backgroundColor: 'transparent',
                                boxShadow: '0 0 15px rgba(74, 222, 128, 0.3)',
                            }}
                        >
                            ✓ YOUR PDF IS ON ITS WAY
                        </span>
                    </motion.div>

                    <motion.h1
                        className="mb-4 md:mb-6 px-1 md:px-2 select-text cursor-text"
                        style={{ lineHeight: 1.05 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <span
                            className="inline-block font-normal text-[2rem] max-md:leading-tight md:[font-size:clamp(2rem,5vw,64px)]"
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
                            CHECK YOUR INBOX IN 2 MINUTES
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-gray-300 max-md:text-sm md:text-[17px] max-w-2xl mx-auto px-2 md:px-4"
                        style={{ lineHeight: 1.55 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        The 119 hooks + storytelling structure PDF is being delivered to the email you submitted. If you don't see it within a few minutes, check your spam folder.
                    </motion.p>
                </section>

                {/* Divider */}
                <div className="max-w-3xl mx-auto px-4">
                    <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* App bridge — the conversion moment */}
                <section
                    className="relative max-w-3xl mx-auto px-4 pt-10 md:pt-14 pb-16 md:pb-24 text-center"
                    style={{ background: 'transparent' }}
                    aria-label="Try Vireact"
                >
                    <motion.h2
                        className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-5"
                        style={{ letterSpacing: '-0.01em' }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        While you're here — one thing.
                    </motion.h2>

                    <motion.p
                        className="text-sm md:text-base text-gray-300 mx-auto max-w-2xl mb-7 md:mb-8"
                        style={{ lineHeight: 1.6 }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        The hooks and structure in that PDF are what I scored my own videos against to find the patterns that worked. I built Vireact to do that scoring automatically. Paste a YouTube Short or upload a clip and it tells you whether the hook lands, where retention will drop, and exactly what to fix. Two free uploads, no credit card.
                    </motion.p>

                    {/* Large, prominent gradient button — the only place app is hard-pitched */}
                    <motion.div
                        className="flex justify-center mb-5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                    >
                        <Link
                            to="/"
                            className="btn-primary btn-primary-hero-nav relative overflow-hidden inline-flex items-center justify-center h-14 md:h-16 px-8 md:px-10 text-base md:text-lg"
                        >
                            Try Vireact free →
                        </Link>
                    </motion.div>

                    {/* Trust line */}
                    <div className="flex flex-row flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-gray-400">
                        <span>Used by 1,000+ creators.</span>
                        <span className="inline-flex items-center gap-1">
                            <span className="inline-flex items-center" aria-hidden>
                                {[1, 2, 3, 4].map((s) => (
                                    <Star key={s} className="w-3.5 h-3.5" style={{ color: '#eab308', fill: '#eab308' }} />
                                ))}
                                <span className="relative inline-flex w-3.5 h-3.5">
                                    <Star className="absolute inset-0 w-3.5 h-3.5" style={{ color: '#a16207', fill: 'none' }} />
                                    <span className="absolute left-0 top-0 h-full overflow-hidden w-[60%] pointer-events-none">
                                        <Star className="w-3.5 h-3.5" style={{ color: '#eab308', fill: '#eab308' }} />
                                    </span>
                                </span>
                            </span>
                            <span>4.6/5 rating.</span>
                        </span>
                    </div>
                </section>
            </div>
        </PreLoginPage>
    );
}

export default ViralHooksThankYouPage;
