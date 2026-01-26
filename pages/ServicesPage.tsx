
import React from 'react';
import ServicesHeader from '../components/services/ServicesHeader';
import ServicesHero from '../components/services/ServicesHero';
import ServiceNavigation from '../components/services/ServiceNavigation';
import ServiceCategory from '../components/services/ServiceCategory';
import ServicesFooter from '../components/services/ServicesFooter';

// Placeholder data structure - you'll populate this from your spreadsheet
const serviceCategories = [
    {
        id: 'review-automation',
        name: 'Review Automation',
        tagline: 'Grow your online reputation on autopilot',
        description: 'Automated systems that capture more 5-star reviews without the awkward ask.',
        icon: '⭐',
        tiers: [
            {
                name: 'Starter',
                price: 99,
                period: 'month',
                setupFee: 0,
                description: 'Perfect for single-location businesses',
                features: [
                    'Automated Google Review Requests',
                    'SMS & Email Follow-ups',
                    'Custom Review Landing Page',
                    'Basic Analytics Dashboard',
                    'A2P Verified Messaging'
                ],
                popular: false,
                ctaText: 'Get Started',
                ctaLink: '#'
            },
            {
                name: 'Growth',
                price: 199,
                period: 'month',
                setupFee: 0,
                description: 'For businesses ready to scale',
                features: [
                    'Everything in Starter',
                    'Multi-location Support',
                    'Advanced Review Analytics',
                    'Negative Review Alerts',
                    'Response Templates',
                    'Priority Support'
                ],
                popular: true,
                ctaText: 'Get Started',
                ctaLink: '#'
            },
            {
                name: 'Enterprise',
                price: null,
                period: 'custom',
                setupFee: null,
                description: 'Custom solutions for large organizations',
                features: [
                    'Everything in Growth',
                    'Unlimited Locations',
                    'Dedicated Account Manager',
                    'Custom API Integrations',
                    'White-label Options',
                    'Volume Pricing'
                ],
                popular: false,
                ctaText: 'Contact Us',
                ctaLink: '#'
            }
        ]
    },
    {
        id: 'web-design',
        name: 'Website Design',
        tagline: 'Stunning websites that convert visitors into customers',
        description: 'Modern, mobile-first websites designed to showcase your business and drive action.',
        icon: '🌐',
        tiers: [
            {
                name: 'Basic Site',
                price: 1500,
                period: 'one-time',
                setupFee: null,
                description: 'Clean, professional 5-page website',
                features: [
                    '5 Custom Pages',
                    'Mobile Responsive Design',
                    'Contact Form Integration',
                    'Basic SEO Setup',
                    '1 Month of Support'
                ],
                popular: false,
                ctaText: 'Learn More',
                ctaLink: '#'
            },
            {
                name: 'Business Pro',
                price: 3500,
                period: 'one-time',
                setupFee: null,
                description: 'Full-featured business website',
                features: [
                    'Up to 15 Pages',
                    'Advanced Animations',
                    'Blog/News Section',
                    'Lead Capture Forms',
                    'Advanced SEO',
                    '3 Months Support'
                ],
                popular: true,
                ctaText: 'Learn More',
                ctaLink: '#'
            },
            {
                name: 'E-Commerce',
                price: 6000,
                period: 'one-time',
                setupFee: null,
                description: 'Full online store setup',
                features: [
                    'Unlimited Products',
                    'Shopping Cart & Checkout',
                    'Payment Processing',
                    'Inventory Management',
                    'Customer Accounts',
                    '6 Months Support'
                ],
                popular: false,
                ctaText: 'Learn More',
                ctaLink: '#'
            }
        ]
    },
    {
        id: 'lead-generation',
        name: 'Lead Generation',
        tagline: 'Fill your pipeline with qualified prospects',
        description: 'Targeted campaigns that bring high-quality leads directly to your business.',
        icon: '📈',
        tiers: [
            {
                name: 'Starter Campaign',
                price: 500,
                period: 'month',
                setupFee: 250,
                description: 'Get your first leads flowing',
                features: [
                    '500 Outreach Emails/Month',
                    'Basic Lead Targeting',
                    'Weekly Reports',
                    'Email Templates',
                    'CRM Integration'
                ],
                popular: false,
                ctaText: 'Start Generating',
                ctaLink: '#'
            },
            {
                name: 'Growth Engine',
                price: 1200,
                period: 'month',
                setupFee: 500,
                description: 'Scale your lead generation',
                features: [
                    '2,000 Outreach Emails/Month',
                    'Advanced Targeting & Personalization',
                    'Multi-channel Campaigns',
                    'A/B Testing',
                    'Real-time Dashboard',
                    'Dedicated Strategist'
                ],
                popular: true,
                ctaText: 'Start Generating',
                ctaLink: '#'
            },
            {
                name: 'Full Funnel',
                price: 2500,
                period: 'month',
                setupFee: 1000,
                description: 'Complete lead-to-close system',
                features: [
                    'Unlimited Outreach',
                    'Complete Sales Funnel Build',
                    'Landing Page Creation',
                    'Retargeting Ads',
                    'Appointment Booking',
                    'Sales Enablement'
                ],
                popular: false,
                ctaText: 'Start Generating',
                ctaLink: '#'
            }
        ]
    },
    {
        id: 'social-media',
        name: 'Social Media Management',
        tagline: 'Build your brand presence across platforms',
        description: 'Strategic content creation and community management to grow your social following.',
        icon: '📱',
        tiers: [
            {
                name: 'Essential',
                price: 400,
                period: 'month',
                setupFee: 0,
                description: 'Maintain consistent presence',
                features: [
                    '12 Posts/Month',
                    '2 Platforms',
                    'Content Calendar',
                    'Basic Graphics',
                    'Monthly Report'
                ],
                popular: false,
                ctaText: 'Get Started',
                ctaLink: '#'
            },
            {
                name: 'Professional',
                price: 800,
                period: 'month',
                setupFee: 0,
                description: 'Grow your engagement',
                features: [
                    '20 Posts/Month',
                    '4 Platforms',
                    'Story Content',
                    'Community Management',
                    'Competitor Analysis',
                    'Bi-weekly Reports'
                ],
                popular: true,
                ctaText: 'Get Started',
                ctaLink: '#'
            },
            {
                name: 'Premium',
                price: 1500,
                period: 'month',
                setupFee: 0,
                description: 'Dominate your market',
                features: [
                    'Daily Posting',
                    'All Major Platforms',
                    'Video Content Creation',
                    'Influencer Outreach',
                    'Paid Ad Management',
                    'Weekly Strategy Calls'
                ],
                popular: false,
                ctaText: 'Get Started',
                ctaLink: '#'
            }
        ]
    },
    {
        id: 'seo',
        name: 'SEO Services',
        tagline: 'Rank higher, get found, grow organically',
        description: 'Search engine optimization that drives long-term sustainable traffic to your business.',
        icon: '🔍',
        tiers: [
            {
                name: 'Local SEO',
                price: 600,
                period: 'month',
                setupFee: 300,
                description: 'Dominate local search results',
                features: [
                    'Google Business Optimization',
                    'Local Keyword Targeting',
                    'Citation Building',
                    'Monthly Reporting',
                    'On-page Optimization'
                ],
                popular: false,
                ctaText: 'Boost Rankings',
                ctaLink: '#'
            },
            {
                name: 'Growth SEO',
                price: 1200,
                period: 'month',
                setupFee: 500,
                description: 'Comprehensive SEO strategy',
                features: [
                    'Everything in Local SEO',
                    'Content Strategy',
                    'Technical SEO Audit',
                    'Backlink Building',
                    'Competitor Analysis',
                    'Bi-weekly Reports'
                ],
                popular: true,
                ctaText: 'Boost Rankings',
                ctaLink: '#'
            },
            {
                name: 'Enterprise SEO',
                price: 2500,
                period: 'month',
                setupFee: 1000,
                description: 'Maximum organic growth',
                features: [
                    'Everything in Growth',
                    'Custom Content Creation',
                    'Authority Link Building',
                    'Multi-location SEO',
                    'Advanced Analytics',
                    'Weekly Strategy Sessions'
                ],
                popular: false,
                ctaText: 'Boost Rankings',
                ctaLink: '#'
            }
        ]
    }
];

const ServicesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white text-black selection:bg-primary selection:text-black">
            <ServicesHeader categories={serviceCategories} />
            <main>
                <ServicesHero />
                <ServiceNavigation categories={serviceCategories} />
                {serviceCategories.map((category, index) => (
                    <ServiceCategory
                        key={category.id}
                        category={category}
                        isAlternate={index % 2 === 1}
                    />
                ))}
            </main>
            <ServicesFooter />
        </div>
    );
};

export default ServicesPage;
