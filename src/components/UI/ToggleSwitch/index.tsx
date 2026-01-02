import React from 'react';

const ToggleSwitch: React.FC<{
    isOn: boolean;
    setIsOn: (isOn: boolean) => void;
    className?: string;
}> = ({
    isOn,
    setIsOn,
    className = '',
}) => {
        return (
            <div className={`flex items-center justify-center gap-4 ${className}`}>
                <button
                    onClick={() => setIsOn(!isOn)}
                    className="relative w-11 h-6 bg-gray-600 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                    <div className={`
                    absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200
                    ${isOn ? 'translate-x-5' : 'translate-x-0'}
                `} />
                </button>
            </div>
        );
    };

export default ToggleSwitch;
