import bgImage from '@/assets/footer/footer-video-poster.jpg';


export default function BottomCta() {
    return (
        <div className="relative">
            {/* Background Image Container */}
            <div className="relative w-full max-w-6xl mx-auto">
                {/* Single Background Image */}
                <div className="relative aspect-[3/2] rounded-lg overflow-hidden shadow-2xl">
                    <img
                        src={bgImage}
                        alt="Video poster background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs"></div>
                </div>

                {/* Inner Shadows on all 4 sides */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Top shadow */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/50 to-transparent"></div>
                    {/* Bottom shadow */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent"></div>
                    {/* Left shadow */}
                    <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-black/50 to-transparent"></div>
                    {/* Right shadow */}
                    <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-black/50 to-transparent"></div>
                </div>

                {/* Central Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center rounded-2xl p-8">
                        <h3 className="uppercase text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                            <span></span>
                            Your videos optimized to go viral - {' '}
                            <span className="!text-green-500">FREE</span>
                        </h3>
                        <button className="btn-secondary !mx-auto text-lg mb-4">
                            Predict My Views Now
                        </button>
                        <p className="text-gray-300 text-base font-medium">
                            FREE forever on our free plan
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}