
import React from 'react';
import PricingTier from './PricingTier';

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

interface Category {
    id: string;
    name: string;
    tagline: string;
    description: string;
    icon: string;
    tiers: Tier[];
}

interface ServiceCategoryProps {
    category: Category;
    isAlternate: boolean;
}

const ServiceCategory: React.FC<ServiceCategoryProps> = ({ category, isAlternate }) => {
    return (
        <section
            id={category.id}
            className={`py-24 ${isAlternate ? 'bg-offWhite' : 'bg-white'}`}
        >
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <span className="text-4xl">{category.icon}</span>
                        <span className="text-primary font-bold text-sm uppercase tracking-widest">
                            {category.name}
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-black leading-tight">
                        {category.tagline}
                    </h2>
                    <p className="text-charcoal/50 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        {category.description}
                    </p>
                </div>

                {/* Pricing Tiers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.tiers.map((tier, index) => (
                        <PricingTier key={index} tier={tier} />
                    ))}
                </div>

                {/* Learn More Link */}
                <div className="text-center mt-12">
                    <a
                        href={`#${category.id}-details`}
                        className="inline-flex items-center gap-2 text-charcoal/60 hover:text-primary font-semibold transition-colors group"
                    >
                        Learn more about our {category.name.toLowerCase()} services
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="transform group-hover:translate-x-1 transition-transform"
                        >
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ServiceCategory;
