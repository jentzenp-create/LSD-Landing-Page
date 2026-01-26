
import React from 'react';

interface Tier {
    name: string;
    price: number | null;
    period: string;
    setupFee: number | null;
    description: string;
    features: string[];
    popular: boolean;
    ctaText: string;
    ctaLink: string;
}

interface PricingTierProps {
    tier: Tier;
}

const PricingTier: React.FC<PricingTierProps> = ({ tier }) => {
    const formatPrice = (price: number | null, period: string) => {
        if (price === null) {
            return { main: 'Custom', sub: 'Contact for pricing' };
        }

        const periodLabels: { [key: string]: string } = {
            'month': '/month',
            'one-time': ' one-time',
            'custom': ''
        };

        return {
            main: `$${price.toLocaleString()}`,
            sub: periodLabels[period] || `/${period}`
        };
    };

    const priceDisplay = formatPrice(tier.price, tier.period);

    return (
        <div className={`relative group ${tier.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}>
            {/* Popular badge glow effect */}
            {tier.popular && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-[32px] blur-sm opacity-75 group-hover:opacity-100 transition-opacity" />
            )}

            <div className={`relative h-full bg-white border rounded-[28px] p-8 md:p-10 flex flex-col transition-all duration-300 ${tier.popular
                    ? 'border-primary/30 shadow-2xl shadow-primary/20 hover:shadow-primary/30'
                    : 'border-black/5 hover:border-black/10 hover:shadow-xl'
                }`}>
                {/* Popular Badge */}
                {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                            Most Popular
                        </span>
                    </div>
                )}

                {/* Tier Header */}
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-black mb-2">{tier.name}</h3>
                    <p className="text-charcoal/50 font-medium text-sm">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-black/5">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl md:text-5xl font-black text-black">{priceDisplay.main}</span>
                        <span className="text-charcoal/40 font-bold text-lg">{priceDisplay.sub}</span>
                    </div>
                    {tier.setupFee !== null && tier.setupFee > 0 && (
                        <p className="text-charcoal/40 font-medium mt-2 text-sm">
                            + ${tier.setupFee} one-time setup fee
                        </p>
                    )}
                    {tier.setupFee === 0 && (
                        <p className="text-primary font-bold mt-2 text-sm">
                            $0 Setup Fee
                        </p>
                    )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8 flex-grow">
                    {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tier.popular ? 'bg-primary/20' : 'bg-black/5'
                                }`}>
                                <svg className={`w-3 h-3 ${tier.popular ? 'text-black' : 'text-charcoal/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-charcoal/70 font-medium text-sm leading-tight">{feature}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <a
                    href={tier.ctaLink}
                    className={`w-full py-4 rounded-full font-bold text-center transition-all ${tier.popular
                            ? 'bg-black text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                            : 'bg-offWhite text-black border border-black/10 hover:bg-black hover:text-white hover:border-black'
                        }`}
                >
                    {tier.ctaText}
                </a>
            </div>
        </div>
    );
};

export default PricingTier;
