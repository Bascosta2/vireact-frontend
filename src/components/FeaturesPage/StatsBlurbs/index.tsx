import Blurb from "@/components/FeaturesPage/StatsBlurbs/Blurb"
import type { IconType } from "react-icons";

interface StatsBlurbProps {
    Icon: IconType;
    achievement: string,
    subheading: string;
}


function StatsBlurbs({ blurbStats }: { blurbStats: StatsBlurbProps[] }) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-stretch">
                {blurbStats.map((blurb) => (
                    <Blurb
                        key={blurb.subheading}
                        Icon={blurb.Icon}
                        achievement={blurb.achievement}
                        subheading={blurb.subheading}
                    />
                ))}
            </div>
        </div>
    )
}

export default StatsBlurbs