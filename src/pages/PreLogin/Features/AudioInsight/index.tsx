import PreLoginPage from "@/components/Layout/PreLoginPage";
import FeaturesPage from "@/components/FeaturesPage";
import { audioStats } from "@/pages/PreLogin/Features/AudioInsight/audio-stats";

function AudioInsight() {
    return (
        <PreLoginPage>
            <FeaturesPage
                badge="Audio Analysis"
                heading="Perfect Your Video's Sound for Maximum Impact"
                description="Get AI-powered audio insights that analyze background music, voice clarity, and sound quality to ensure your content sounds professional and engaging."
                ctaHeading="Optimize Your Audio for Better Engagement"
                blurbStats={audioStats}
            />
        </PreLoginPage>
    )
}

export default AudioInsight