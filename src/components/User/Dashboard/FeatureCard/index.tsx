import { FaCheck } from 'react-icons/fa';
import type { IconType } from 'react-icons';



interface FeatureCardProps {
    Icon: IconType;
    title: string;
    isSelected: boolean;
    onSelect: () => void;
    className?: string;
  }
  


export default function FeatureCard({ Icon, title, isSelected, onSelect, className = '' }: FeatureCardProps) {
    return (
      <div className={`relative flex-shrink-0 ${className} py-4 px-4`}>
        {/* Background Card */}
        <button
          onClick={onSelect}
          className="w-full bg-gradient-primary rounded-3xl p-4 sm:p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            {/* Icon Container */}
            <div className="rounded-full p-3 sm:p-4 backdrop-blur-sm bg-white bg-opacity-20 transition-colors">
              <Icon className="w-6 h-6 text-black" />
            </div>
            
            {/* Title */}
            <h4 className="font-semibold !font-roboto text-center text-xs sm:text-sm leading-tight text-white">
              {title}
            </h4>
            
            {/* Green Checkmark */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                <FaCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </button>
      </div>
    );
  }