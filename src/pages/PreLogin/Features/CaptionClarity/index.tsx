import PreLoginPage from "@/components/Layout/PreLoginPage";
import FeaturesPage from "@/components/FeaturesPage";
import { captionStats } from "@/pages/PreLogin/Features/CaptionClarity/caption-stats";

function CaptionClarity() {
    return (
        <PreLoginPage>
            <FeaturesPage
                badge="Caption Analysis"
                heading="Write Captions That Hook Your Audience"
                description="Our AI analyzes your video captions for clarity, engagement potential, and viral keywords to help you craft compelling text that drives views and interactions."
                ctaHeading="Create Captivating Captions That Convert"
                blurbStats={captionStats}
            />
        </PreLoginPage>
    )
}

export default CaptionClarity