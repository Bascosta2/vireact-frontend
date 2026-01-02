import React from 'react';
import type { PricingToggleProps } from '@/types/pricing';
import ToggleSwitch from '@/components/UI/ToggleSwitch';

const PricingToggle: React.FC<PricingToggleProps> = ({
    isOn,
    setIsOn,
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-center gap-4 ${className}`}>
            <span className={`text-lg font-normal leading-relaxed transition-colors duration-200 ${
                !isOn ? 'text-white' : 'text-gray-400'
            }`}>
                Monthly
            </span>
            
            <ToggleSwitch
                isOn={isOn}
                setIsOn={setIsOn}
            />
            
            <span className={`text-lg font-normal leading-relaxed transition-colors duration-200 ${
                isOn ? 'text-white' : 'text-gray-400'
            }`}>
                Yearly
            </span>
        </div>
    );
};

export default PricingToggle;
