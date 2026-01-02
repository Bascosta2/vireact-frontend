import React from 'react';

interface WhyChooseUsCardProps {
    icon: string;
    title: string;
    description: string;
}

function WhyChooseUsCard({ card, index }: { card: WhyChooseUsCardProps; index: number }) {
    const { icon, title, description } = card;
    
    return (
        <div className="flex-shrink-0 w-80 mx-3 relative overflow-hidden border-gradient-secondary rounded-2xl">
            <div className="bg-dark-primary bg-opacity-50 backdrop-blur-lg border border-gray-500 rounded-2xl p-6 h-full min-h-72">
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center mx-auto mb-4">
                        <img 
                            src={icon} 
                            alt={title}
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    <h3 className="text-xl font-heading font-normal text-white mb-3">
                        {title}
                    </h3>
                </div>

                <div className="text-center">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default WhyChooseUsCard;