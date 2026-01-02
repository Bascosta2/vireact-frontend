import PreLoginPage from "@/components/Layout/PreLoginPage";
import FeaturesPage from "@/components/FeaturesPage";
import { viralStats } from "@/pages/PreLogin/Features/ViralPredictor/viral-stats"


function ViralPredictor() {
    return (
        <PreLoginPage>
            <FeaturesPage
                badge="Shorts Views Predictor"
                heading="Predict Your Next Viral Video Before You Post"
                description="Upload your video, and our AI-powered Viral View Predictor shows you how likely it is to trend ,  with instant feedback on hooks, captions, pacing, and audience engagement."
                ctaHeading="Predict Your Video's Viral Potential in Seconds"
                blurbStats={viralStats}
            />
        </PreLoginPage>
    )
}

export default ViralPredictor