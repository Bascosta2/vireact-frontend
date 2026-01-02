import PreLoginPage from "@/components/Layout/PreLoginPage";
import FeaturesPage from "@/components/FeaturesPage";
import { flowStats } from "@/pages/PreLogin/Features/PacingAndRhythm/pacing-and-rhythm-stats";

function PacingAndRhythm() {
    return (
        <PreLoginPage>
            <FeaturesPage
                badge="Content Flow Analysis"
                heading="Master the Perfect Video Flow and Pacing"
                description="Analyze your video's narrative flow, transitions, and pacing to create content that keeps viewers engaged from start to finish with AI-powered insights."
                ctaHeading="Create Seamless Content That Holds Attention"
                blurbStats={flowStats}
            />
        </PreLoginPage>
    )
}

export default PacingAndRhythm 