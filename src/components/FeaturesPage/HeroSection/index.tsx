import UploadCTA from '@/components/UploadCTA'

interface FeaturesHeroSectionProps {
    badge?: string;
    heading?: string
    description?: string
}


// reusbale hero section for features page
function HeroSection({ badge = "Your Shortcut to Viral Content", heading = "Turn Your Clips Into Viral Hits", description = "From TikToks to YouTube Shorts, Instagram Reels to Facebook videos, our AI reviews your video, predicts views and tells you exactly what changes will help it blow up." }: FeaturesHeroSectionProps) {
    return (
        <div 
        className="text-center pt-12">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-2 bg-gray bg-dark-primary border-gradient-primary rounded-full mb-4">
                <span className="text-sm text-white uppercase">
                    {badge}
                </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-normal leading-tight text-white
                     mb-6">
                {heading}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                {description}
            </p>

            <UploadCTA location="features_hero" />
        </div>
    )
}

export default HeroSection