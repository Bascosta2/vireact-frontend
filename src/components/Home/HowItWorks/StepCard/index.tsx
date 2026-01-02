import { type HowItWorksStep } from '@/components/Home/HowItWorks/how-it-works-items';


interface StepCardProps {
    step: HowItWorksStep;
}


function StepCard({ step }: StepCardProps) {
    const IconComponent = step.icon;

    return (
        <div className="glassmorphism rounded-[24px] p-6 md:p-8 flex flex-col items-center text-center relative border-gradient-secondary">
            {/* Step Number Badge */}
            <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white/20">
                <span className="text-white font-bold text-lg md:text-xl">
                    {step.id}
                </span>
            </div>
            
            {/* Icon Container */}
            <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            
            {/* Title with Step Number */}
            <h3 className="text-xl md:text-2xl lg:text-3xl font-normal leading-[1.2] text-white mb-4">
                {step.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm md:text-base font-roboto font-normal leading-[1.4375] text-white">
                {step.description}
            </p>
        </div>
    );
}

export default StepCard;