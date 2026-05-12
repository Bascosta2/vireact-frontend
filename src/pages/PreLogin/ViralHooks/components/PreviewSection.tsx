import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

/**
 * Single blurred / partial-page preview of the PDF. The actual asset is a
 * placeholder at /pdf-preview.png that the operator replaces. We gracefully
 * fall back to a styled placeholder card if the image is missing so the page
 * doesn't show a broken-image icon during dev.
 */
function PreviewSection() {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <section
            className="relative w-full px-4 py-8 md:py-12"
            aria-label="PDF page preview"
            style={{ background: 'transparent' }}
        >
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                    }}
                >
                    {!imageFailed ? (
                        <img
                            src="/pdf-preview.png"
                            alt="Preview of page 5 of the 119 Viral Hooks PDF"
                            className="block w-full h-auto object-cover"
                            style={{ filter: 'blur(0.6px)' }}
                            onError={() => setImageFailed(true)}
                        />
                    ) : (
                        <div className="aspect-[4/5] w-full flex flex-col items-center justify-center gap-3 text-center px-6 py-12">
                            <FileText className="w-10 h-10 text-zinc-500" aria-hidden />
                            <p className="text-sm text-zinc-400 max-w-sm">
                                PDF preview image will appear here once <code className="text-zinc-300">/pdf-preview.png</code> is added.
                            </p>
                        </div>
                    )}
                    {/* Soft top-to-bottom fade so the "peek" framing feels intentional */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                        style={{
                            background: 'linear-gradient(to bottom, transparent, rgba(10,10,15,0.7))',
                        }}
                    />
                </motion.div>
                <p className="mt-3 text-center text-xs md:text-sm text-gray-400">
                    A peek inside — page 5 of 20.
                </p>
            </div>
        </section>
    );
}

export default PreviewSection;
