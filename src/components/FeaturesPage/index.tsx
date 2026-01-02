import HeroSection from "@/components/FeaturesPage/HeroSection"
import StatsBlurbs from "@/components/FeaturesPage/StatsBlurbs"
import CreatorsAndBusinesses from "@/components/FeaturesPage/CreatorsAndBusinesses"
import Niches from "@/components/FeaturesPage/Niches"
import CTA from "@/components/FeaturesPage/CTA"
import type { IconType } from "react-icons"


interface StatsBlurb {
    Icon: IconType;
    achievement: string,
    subheading: string;
}

interface FeaturesPageProps {
    badge: string;
    heading: string;
    description: string;
    ctaHeading: string;
    blurbStats: StatsBlurb[];
}


function FeaturesPage({
    badge,
    heading,
    description,
    ctaHeading,
    blurbStats
}: FeaturesPageProps) {
    return (
        <>
            <div className="bg-[url('/gradient-bg.png')] bg-cover bg-center bg-no-repeat">

                <HeroSection
                    badge={badge}
                    heading={heading}
                    description={description} />
                <StatsBlurbs blurbStats={blurbStats} />
                <CreatorsAndBusinesses />
            </div>
            <Niches />
            <CTA
                ctaHeading={ctaHeading}
            />
        </>
    )
}

export default FeaturesPage