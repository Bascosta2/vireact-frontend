import { FaCheck, FaExclamationTriangle } from "react-icons/fa"
import { freeFeatures } from "@/pages/PreLogin/Pricing/pricing-items"

function FreePlan() {
  return (
    <div className="mt-16">
    <div className="lg:flex lg:justify-center lg:items-center lg:min-h-[400px]">
        <div className="max-w-4xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Free Plan Info */}
                <div className="text-left lg:flex lg:flex-col lg:justify-center">
                    <h3 className="text-6xl font-heading font-normal leading-tight text-white mb-2">
                        Free
                    </h3>
                    <p className="text-sm font-normal leading-relaxed text-gray-400 mb-4">
                        Free forever
                    </p>
                    <div className="text-4xl font-heading font-normal leading-tight text-white mb-6">
                        $0 USD/mo
                    </div>
                    <div className="flex justify-start">
                        <button className="btn-outline">
                            Create an account
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 text-left">
                    <div className="space-y-3">
                        {freeFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center gap-x-3">
                                <div className="">
                                    {feature.type === 'warning' ? (
                                        <FaExclamationTriangle className="w-3 h-3 text-red-500" />
                                    ) : (
                                        <FaCheck className="w-3 h-3 text-green-500" />
                                    )}
                                </div>
                                <p className="text-xs font-normal leading-relaxed text-gray-400">
                                    {feature.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
  )
}

export default FreePlan