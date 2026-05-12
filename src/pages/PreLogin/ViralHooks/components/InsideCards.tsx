import { motion } from 'framer-motion';
import { Scissors, TrendingUp, Lightbulb } from 'lucide-react';

type Accent = 'green' | 'pink' | 'blue';

const ACCENT_BG: Record<Accent, string> = {
    green: 'bg-emerald-500',
    pink: 'bg-pink-500',
    blue: 'bg-blue-500',
};

interface CardData {
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
    accent: Accent;
    heading: string;
    body: string;
}

const CARDS: CardData[] = [
    {
        icon: Scissors,
        accent: 'green',
        heading: '119 PROVEN HOOKS',
        body: 'Categorized by emotion: suspense, controversy, urgency, surprise, danger, relatability. Copy-paste ready for your next script.',
    },
    {
        icon: TrendingUp,
        accent: 'pink',
        heading: 'THE VIRAL STRUCTURE',
        body: 'The 6-step storytelling frame behind 200M+ views. Works for personal brand or faceless channels.',
    },
    {
        icon: Lightbulb,
        accent: 'blue',
        heading: 'THE PLOT TWIST FORMULA',
        body: 'Why your ending matters more than your hook — and the call-to-action that doubles retention on shorts.',
    },
];

/**
 * Three-card "What's inside the PDF" row. Visual styling is a deliberate copy
 * of DifferentiationSection (ACTIONABLE EDITS / VIRALITY PREDICTION /
 * PERSONALIZED COACHING) — same glass background, same icon-in-rounded-square
 * pattern, same heading tracking, same zinc-400 body copy.
 */
function InsideCards() {
    return (
        <section
            className="relative z-[11] w-full px-4 py-12 md:py-20"
            aria-label="What's inside the PDF"
            style={{ background: 'transparent' }}
        >
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    className="text-center text-2xl md:text-3xl font-bold text-white mb-8 md:mb-12 uppercase tracking-tight"
                    style={{ letterSpacing: '-0.02em' }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    What's inside the PDF
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-4 md:gap-6">
                    {CARDS.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.heading}
                                className="flex flex-1 min-w-0 h-full min-h-0"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: 'easeOut' }}
                            >
                                <div
                                    role="article"
                                    aria-label={card.heading}
                                    className="outline-none flex flex-col min-h-0 h-full w-full rounded-xl p-5 transition-all duration-300 ease-out hover:border-[rgba(255,60,172,0.3)]"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        backdropFilter: 'blur(16px)',
                                        WebkitBackdropFilter: 'blur(16px)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                    }}
                                >
                                    <div className="flex-shrink-0">
                                        <div
                                            className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 flex-shrink-0 ${ACCENT_BG[card.accent]}`}
                                        >
                                            <Icon className="w-5 h-5 text-white" aria-hidden />
                                        </div>
                                        <h3
                                            className="text-xl font-bold text-white mb-2 uppercase tracking-tight"
                                            style={{ letterSpacing: '-0.03em' }}
                                        >
                                            {card.heading}
                                        </h3>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <p
                                            className="text-sm text-zinc-400 leading-relaxed text-left w-full"
                                            style={{ lineHeight: 1.5 }}
                                        >
                                            {card.body}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default InsideCards;
