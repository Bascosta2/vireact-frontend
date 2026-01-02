import type{ IconType } from "react-icons"

interface BlurbProps {
    Icon: IconType
    achievement: string
    subheading: string
}

function Blurb({ Icon, achievement, subheading }: BlurbProps) {
    return (
        <div className="flex-1 rounded-xl bg-white/15 p-6 flex flex-col items-center justify-center relative border-1 border-white/20">
            {/* Content */}
            <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="flex items-center justify-center w-12 h-12">
                    <Icon className="text-3xl text-gray-300" />
                </div>
                <div className="flex flex-col items-center justify-center space-y-1">
                    <h3 className="text-3xl font-bold text-gray-100">{achievement}</h3>
                    <p className="text-sm text-gray-400 font-medium">{subheading}</p>
                </div>
            </div>
        </div>
    )
}

export default Blurb