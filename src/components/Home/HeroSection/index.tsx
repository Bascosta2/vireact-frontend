import { FaStar } from 'react-icons/fa';
import { FaRegStar } from 'react-icons/fa';
import HomeSection from '@/components/HomeSection';
import UploadCTA from '@/components/UploadCTA';
import gradientBg from "/gradient-bg.png";
// import vireactDemoVideo from '@/assets/videos/vireact-demo.mp4'; // Commented out for potential future use

function HeroSection() {
    return (
        <HomeSection
            className="min-h-screen flex items-center justify-center overflow-hidden"
            background="custom"
            customBackground={`bg-[url('/gradient-bg.png')] bg-cover bg-center bg-no-repeat`}
            padding="small"
            gradient={false}
            containerClassName="pb-16"
        >
            <div className="text-center">
                {/* Badge */}
                <div className="inline-flex items-center px-6 py-2 bg-gray bg-dark-primary border border-green-500 rounded-full mb-4">
                    <span className="text-sm text-green-500 uppercase">
                        #1 AI short form content tool
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-normal leading-tight text-white mb-4">
                    TURN YOUR CLIPS INTO HITS WITHIN SECONDS
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-white max-w-3xl sm:max-w-md mx-auto mb-8 leading-relaxed">
                Vireact reviews your short, predicts views, and tells you exactly what changes will make it blow up
                </p>

                <UploadCTA
                    uploadButtonText="Upload Here"
                />

                {/* CTA Buttons */}
                {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <Link
                            to="/signup"
                            className="btn-secondary px-8 py-4 text-lg"
                        >
                            Get My Video Reviewed
                        </Link>
                    </div> */}

                {/* Rating */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => {
                            const rating = 4.9;
                            const starValue = i + 1;

                            if (starValue <= Math.floor(rating)) {
                                // Full star
                                return <FaStar key={i} className="w-5 h-5 text-yellow-500" />;
                            } else if (starValue === Math.ceil(rating) && rating % 1 !== 0) {
                                // Partial star - manually set fill percentage for 5th star
                                const fillPercentage = 70; // Adjust this value to control 5th star fill (0-100)
                                return (
                                    <div key={i} className="relative inline-block">
                                        {/* Empty star background */}
                                        <FaStar className="w-5 h-5 text-gray-400" />
                                        {/* Filled portion clipped to percentage */}
                                        <div
                                            className="absolute top-0 left-0 overflow-hidden"
                                            style={{ width: `${fillPercentage}%` }}
                                        >
                                            <FaStar className="w-5 h-5 text-yellow-500" />
                                        </div>
                                    </div>
                                );
                            } else {
                                // Empty star
                                return <FaRegStar key={i} className="w-5 h-5 text-gray-400" />;
                            }
                        })}
                    </div>
                    <span className="text-sm text-gray-300">4.9/5 based on 1000+ reviews</span>
                </div>



                {/* Video Preview */}
                <div className="relative max-w-4xl mx-auto mt-12 px-4">
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl shadow-secondary">
                        {/* Static Video - Commented out for potential future use */}
                        {/* <video 
                                className="w-full h-full object-cover rounded-2xl"
                                autoPlay 
                                muted 
                                loop
                                playsInline
                            >
                                <source src={vireactDemoVideo} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video> */}

                        {/* Embedded Vimeo Video */}
                        <div className="relative w-full h-full">
                            <iframe
                                src="https://player.vimeo.com/video/1112638010?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=0&loop=1"
                                className="absolute top-0 left-0 w-full h-full rounded-2xl"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                title="Best SaaS Product Demo Video"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </HomeSection>
    );
}

export default HeroSection;