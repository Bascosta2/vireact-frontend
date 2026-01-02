import PreLoginPage from "@/components/Layout/PreLoginPage";
import FeaturesPage from "@/components/FeaturesPage";
import { advancedAnalyticsStats } from "@/pages/PreLogin/Features/AdvancedAnalytics/advanced-analytics-stats";

function AdvancedAnalytics() {
    return (
        <PreLoginPage>
            <FeaturesPage
                badge="Advanced Analytics"
                heading="YouTube like advanced analytics before even posting"
                description="Get Anlytics like Avergae View Duration, Watch Time, Engagement Rate, etc."
                ctaHeading="Let's check your video's analytics"
                blurbStats={advancedAnalyticsStats}
            />
        </PreLoginPage>
    )
}

export default AdvancedAnalytics