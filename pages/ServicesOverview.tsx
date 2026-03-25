
import React from 'react';
import { Link } from 'react-router-dom';
import ServicesHeader from '../components/services/ServicesHeader';
import ServicesHero from '../components/services/ServicesHero';
import ServicesFooter from '../components/services/ServicesFooter';

// Service data - extracted for reuse
export const serviceCategories = [
    {
        id: 'review-automation',
        name: 'Review Automation',
        tagline: 'Grow your online reputation on autopilot',
        description: 'Automated systems that capture more 5-star reviews without the awkward ask.',
        icon: '⭐',
        startingPrice: 99,
        period: 'month',
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
                ctaLink: '/contact'
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
                ctaLink: '/contact'
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
                ctaLink: '/contact'
            }
        ],
        valueProps: [
            { title: 'Automated Outreach', description: 'Send review requests automatically after every service without lifting a finger.' },
            { title: 'Multi-Channel', description: 'Reach customers via SMS, email, or both for maximum response rates.' },
            { title: 'Smart Timing', description: 'AI-optimized send times to catch customers when they\'re most likely to respond.' }
        ]
    },
    {
        id: 'web-design',
        name: 'Website Design',
        tagline: 'Stunning websites that convert visitors into customers',
        description: 'Modern, mobile-first websites designed to showcase your business and drive action.',
        icon: '🌐',
        startingPrice: 1500,
        period: 'one-time',
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
                ctaLink: '/contact'
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
                ctaLink: '/contact'
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
                ctaLink: '/contact'
            }
        ],
        valueProps: [
            { title: 'Mobile-First Design', description: 'Every site is built mobile-first, ensuring perfect display on all devices.' },
            { title: 'Conversion Focused', description: 'Strategic layouts designed to guide visitors toward taking action.' },
            { title: 'SEO Ready', description: 'Built with search engines in mind from day one.' }
        ]
    },
    {
        id: 'ai-automation',
        name: 'AI Automation',
        tagline: 'Supercharge your business with intelligent automation',
        description: 'Custom AI solutions that save time and boost efficiency across your operations.',
        icon: '🤖',
        startingPrice: 299,
        period: 'month',
        tiers: [
            {
                name: 'Starter',
                price: 299,
                period: 'month',
                setupFee: 199,
                description: 'Essential AI tools for small teams',
                features: [
                    'AI Chatbot (1 Platform)',
                    'Basic Workflow Automation',
                    'Email Response Assistant',
                    'Monthly Usage: 1,000 AI Credits',
                    'Email Support'
                ],
                popular: false,
                ctaText: 'Get Started',
                ctaLink: '/contact'
            },
            {
                name: 'Business',
                price: 799,
                period: 'month',
                setupFee: 499,
                description: 'Full AI suite for growing businesses',
                features: [
                    'AI Chatbot (Multi-platform)',
                    'Advanced Workflow Automation',
                    'AI Content Generator',
                    'Lead Scoring & Qualification',
                    'Monthly Usage: 5,000 AI Credits',
                    'Priority Support'
                ],
                popular: true,
                ctaText: 'Get Started',
                ctaLink: '/contact'
            },
            {
                name: 'Enterprise',
                price: null,
                period: 'custom',
                setupFee: null,
                description: 'Custom AI solutions at scale',
                features: [
                    'Custom AI Model Training',
                    'Custom Automations',
                    'API Access & Integrations',
                    'Dedicated AI Strategist'
                ],
                popular: false,
                ctaText: 'Contact Us',
                ctaLink: '/contact'
            }
        ],
        valueProps: [
            { title: '24/7 Availability', description: 'AI chatbots handle inquiries around the clock, never missing a lead.' },
            { title: 'Smart Automation', description: 'Automate repetitive tasks and free up your team for high-value work.' },
            { title: 'Scalable Intelligence', description: 'AI that learns and improves as your business grows.' }
        ]
    },
    {
        id: 'lead-generation',
        name: 'Lead Generation',
        tagline: 'Fill your pipeline with qualified prospects',
        description: 'Targeted campaigns that bring high-quality leads directly to your business.',
        icon: '📈',
        startingPrice: 500,
        period: 'month',
        tiers: [
            {
                name: 'Starter Campaign',
                price: 500,
                period: 'month',
                setupFee: 250,
                description: 'Get your first leads flowing',
                features: [
                    '5000 Outreach Emails/Month',
                    'Basic Lead Targeting',
                    'Weekly Reports',
                    'Email Templates',
                    'CRM Integration'
                ],
                popular: false,
                ctaText: 'Start Generating',
                ctaLink: '/contact'
            },
            {
                name: 'Growth Engine',
                price: 1200,
                period: 'month',
                setupFee: 500,
                description: 'Scale your lead generation',
                features: [
                    '15,000 Outreach Emails/Month',
                    'Advanced Targeting & Personalization',
                    'Multi-channel Campaigns',
                    'A/B Testing',
                    'Real-time Dashboard',
                    'Dedicated Strategist'
                ],
                popular: true,
                ctaText: 'Start Generating',
                ctaLink: '/contact'
            },
            {
                name: 'Full Funnel',
                price: 2500,
                period: 'month',
                setupFee: 1000,
                description: 'Complete lead-to-close system',
                features: [
                    '30,000+ Outreach',
                    'Complete Sales Funnel Build',
                    'Landing Page Creation',
                    'Retargeting Ads',
                    'Appointment Booking',
                    'Sales Enablement'
                ],
                popular: false,
                ctaText: 'Start Generating',
                ctaLink: '/contact'
            }
        ],
        valueProps: [
            { title: 'Targeted Outreach', description: 'We find and reach your ideal customers with precision targeting.' },
            { title: 'Warm Leads', description: 'No cold calling - we deliver prospects already interested in your services.' },
            { title: 'Scalable Systems', description: 'Start small and scale up as your business grows.' }
        ]
    },
    {
        id: 'social-media',
        name: 'Social Media Management',
        tagline: 'Build your brand presence across platforms',
        description: 'Strategic content creation and community management to grow your social following.',
        icon: '📱',
        startingPrice: 400,
        period: 'month',
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
                ctaLink: '/contact'
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
                    '4x Custom Video Creation',
                    'Competitor Analysis',
                    'Bi-weekly Reports'
                ],
                popular: true,
                ctaText: 'Get Started',
                ctaLink: '/contact'
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
                    '8x Video Content Creation',
                    'Influencer Outreach',
                    'Paid Ad Management',
                    'Weekly Strategy Calls'
                ],
                popular: false,
                ctaText: 'Get Started',
                ctaLink: '/contact'
            }
        ],
        valueProps: [
            { title: 'Consistent Presence', description: 'Never miss a day with scheduled content managed by our team.' },
            { title: 'Engaging Content', description: 'Eye-catching graphics and copy that resonates with your audience.' },
            { title: 'Community Building', description: 'Active engagement to build real relationships with followers.' }
        ]
    },
    {
        id: 'seo',
        name: 'SEO Services',
        tagline: 'Rank higher, get found, grow organically',
        description: 'Search engine optimization that drives long-term sustainable traffic to your business.',
        icon: '🔍',
        startingPrice: 600,
        period: 'month',
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
                ctaLink: '/contact'
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
                    'Competitor Analysis'
                ],
                popular: true,
                ctaText: 'Boost Rankings',
                ctaLink: '/contact'
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
                    'Advanced Analytics'
                ],
                popular: false,
                ctaText: 'Boost Rankings',
                ctaLink: '/contact'
            }
        ],
        valueProps: [
            { title: 'Local Dominance', description: 'Show up first when customers search for services in your area.' },
            { title: 'Organic Traffic', description: 'Build sustainable traffic that doesn\'t require ongoing ad spend.' },
            { title: 'Data-Driven', description: 'Every decision backed by analytics and real performance data.' }
        ]
    }
];

// Service card component for the overview
const ServiceCard: React.FC<{ service: typeof serviceCategories[0] }> = ({ service }) => {
    const priceDisplay = service.startingPrice
        ? `$${service.startingPrice}${service.period === 'month' ? '/mo' : ''}`
        : 'Custom';

    return (
        <Link
            to={`/services/${service.id}`}
            className="group bg-white border border-black/5 rounded-3xl p-8 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1"
        >
            <div className="text-5xl mb-6">{service.icon}</div>
            <h3 className="text-2xl font-bold text-black mb-2 group-hover:text-primary transition-colors">
                {service.name}
            </h3>
            <p className="text-charcoal/60 mb-6 leading-relaxed">
                {service.tagline}
            </p>
            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-sm text-charcoal/40 font-medium">Starting at</span>
                <span className="text-2xl font-bold text-black">{priceDisplay}</span>
            </div>
            <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                Learn More
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </Link>
    );
};

const ServicesOverview: React.FC = () => {
    return (
        <div className="min-h-screen bg-white text-black selection:bg-primary selection:text-black">
            <ServicesHeader categories={serviceCategories} />
            <main>
                <ServicesHero />

                {/* Services Grid */}
                <section id="services" className="py-16 sm:py-24 bg-offWhite">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                                Our Services
                            </h2>
                            <p className="text-lg text-charcoal/60 max-w-2xl mx-auto">
                                Explore our full suite of digital growth solutions. Click any service to see detailed pricing and features.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {serviceCategories.map(service => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 sm:py-24 bg-black text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                            Not Sure Where to Start?
                        </h2>
                        <p className="text-xl text-white/70 mb-8">
                            Book a free consultation and we'll help you find the perfect solution for your business.
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-primary text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                        >
                            Get Free Consultation
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    </div>
                </section>
            </main>
            <ServicesFooter />
        </div>
    );
};

export default ServicesOverview;
