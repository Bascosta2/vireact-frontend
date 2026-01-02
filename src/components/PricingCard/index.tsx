import React from 'react';
import { FaCheck, FaStar } from 'react-icons/fa';
import { IoWarningOutline } from 'react-icons/io5';
import type { PricingCardProps, PricingFeature } from '@/types/pricing';

const PricingCard: React.FC<PricingCardProps> = ({
    isYearly,
    title,
    description,
    price,
    originalPrice,
    discountPrice,
    billingPeriod,
    features,
    ctaText,
    ctaSubtext,
    isPopular = false,
    isDisabled = false,
    className = ''
}) => {
    return (
        <article className={`
            relative bg-black border-2 rounded-2xl p-6
            ${isPopular
                ? 'border-gradient-primary shadow-lg shadow-orange-500/20'
                : 'border-white/60 hover:border-white/80'
            }
            ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            ${className}
        `}>
            {/* Popular Badge */}
            {/* {isPopular && (
                <div className="flex justify-center mb-4">
                    <div className="bg-white text-black px-3 py-1 rounded-full flex items-center gap-2">
                        <FaStar className="w-3 h-3 text-black" />
                        <span className="text-xs font-semibold text-black">
                            80% users choose this
                        </span>
                    </div>
                </div>
            )} */}

            {/* Header */}
            <div className="mb-6">
                <h3 className="text-6xl font-heading font-normal leading-tight text-white mb-2">
                    {title}
                </h3>
                <p className="text-sm font-normal leading-relaxed text-gray-400 mb-4">
                    {description}
                </p>



                {/* CTA Button */}
                <div className="space-y-2 mb-4">
                    <button
                        className={`${isPopular ? 'btn-secondary' : 'btn-outline'} w-full`}
                        disabled={isDisabled}
                    >
                        {ctaText}
                    </button>
                    {ctaSubtext && (
                        <p className="text-xs font-normal leading-relaxed text-gray-400">
                            {ctaSubtext}
                        </p>
                    )}
                </div>

                {/* Price */}
                {originalPrice && (
                    <div className="mb-4">
                        {isYearly && discountPrice ? (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="text-4xl font-heading font-normal leading-tight text-white">
                                        ${discountPrice}/mo
                                    </div>
                                    {originalPrice && (
                                        <div className="text-2xl font-heading font-normal leading-tight text-gray-500 line-through">
                                            ${originalPrice}/mo
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-normal leading-relaxed text-green-500">
                                    Save ${originalPrice && discountPrice ? (originalPrice * 12) - (discountPrice * 12) : 0} with yearly billing
                                </div>
                            </div>
                        ) : (
                            <div className="text-4xl font-heading font-normal leading-tight text-white mb-1">
                                ${originalPrice}/mo
                            </div>
                        )}
                        {billingPeriod && (
                            <div className="text-base font-heading font-normal leading-tight text-white">
                                {billingPeriod}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
                {features.map((feature: PricingFeature, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            {feature.type === 'warning' ? (
                                <IoWarningOutline className="w-3.5 h-3.5 text-orange-500" />
                            ) : (
                                <FaCheck className="w-3.5 h-3.5 text-green-500" />
                            )}
                        </div>
                        <span className="text-xs font-normal leading-relaxed text-gray-400">
                            {feature.text}
                        </span>
                    </div>
                ))}
            </div>

        </article>
    );
};

export default PricingCard;
