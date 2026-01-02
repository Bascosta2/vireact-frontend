interface NicheCardProps {
    category: string;
    alt: string;
    thumbnail: string;
    isFounder?: boolean;
}

function NicheCard({ category, alt, thumbnail, isFounder = false }: NicheCardProps) {
    return (
        <div className="mx-4 w-[240px]">
            {/* Category Label */}
            <div className="mb-3">
                <span className={`inline-block text-xs font-medium border-gradient-primary glassmorphism text-white !rounded-full px-4 py-2`}>
                    {isFounder ? 'Founder (1.1M+ @YouTube)' : category}
                </span>
            </div>

            {/* Content Card */}
            <div className={`relative rounded-xl border overflow-hidden aspect-[9/16] transition-all duration-300 bg-white/10 border-white/20 hover:scale-102`}>
                {/* Thumbnail Image */}
                <img 
                    src={thumbnail} 
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
}

export default NicheCard;
