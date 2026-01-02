import PreLoginPage from "@/components/Layout/PreLoginPage";
import FeaturesPage from "@/components/FeaturesPage";
import { hookStats } from "@/pages/PreLogin/Features/HookAnalyzer/hook-stats";

function HookAnalyzer() {
    return (
        <PreLoginPage>
            <FeaturesPage
                badge="Hook Analysis"
                heading="Create Irresistible Hooks That Stop the Scroll"
                description="Our AI analyzes your video's opening seconds to determine hook strength, viewer retention potential, and provides actionable feedback to make your content unskippable."
                ctaHeading="Build Hooks That Convert Scrollers to Viewers"
                blurbStats={hookStats}
            />
        </PreLoginPage>
    )
}

export default HookAnalyzer