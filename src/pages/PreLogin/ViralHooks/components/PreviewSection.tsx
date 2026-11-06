import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { claims } from '@/content/claims';

/** Real page from the guide (owner-supplied, 1332x428). */
const PREVIEW_SRC = '/viral-hooks-preview.png';

/**
 * A readable peek at one page of the guide, framed like a document on a glowing glass card.
 * Falls back to a neutral card if the image cannot load.
 */
function PreviewSection() {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <section className="relative w-full px-4 py-8 md:py-12" aria-label="Guide preview" style={{ background: 'transparent' }}>
            <div className="mx-auto max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-2xl p-3 sm:p-4"
                    style={{
                        background: 'linear-gradient(160deg, rgba(34,211,238,0.14), rgba(255,255,255,0.03) 45%, rgba(236,72,153,0.14))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 0 40px rgba(34,211,238,0.12), 0 20px 60px rgba(0,0,0,0.45)',
                    }}
                >
                    <div className="mb-3 flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-[0.14em] text-cyan-200/80">
                        <FileText className="h-4 w-4" aria-hidden />
                        Inside the guide
                    </div>
                    {!imageFailed ? (
                        <div className="relative overflow-hidden rounded-xl bg-white">
                            <img
                                src={PREVIEW_SRC}
                                alt={`A page from the ${claims.hookCount} Viral Hooks guide: proven examples for introducing the story, such as "I noticed something strange while I was ___."`}
                                width={1332}
                                height={428}
                                loading="lazy"
                                decoding="async"
                                className="block h-auto w-full"
                                onError={() => setImageFailed(true)}
                            />
                            {/* Soft fade at the bottom so it reads as a peek, not the whole page */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
                                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.9))' }}
                            />
                        </div>
                    ) : (
                        <div className="flex aspect-[3/1] w-full flex-col items-center justify-center gap-3 rounded-xl bg-white/[0.04] px-6 text-center">
                            <FileText className="h-10 w-10 text-zinc-500" aria-hidden />
                            <p className="max-w-sm text-sm text-zinc-400">
                                The {claims.hookCount} Viral Hooks guide.
                            </p>
                        </div>
                    )}
                </motion.div>
                <p className="mt-3 text-center text-xs text-gray-400 md:text-sm">A peek inside the guide.</p>
            </div>
        </section>
    );
}

export default PreviewSection;
