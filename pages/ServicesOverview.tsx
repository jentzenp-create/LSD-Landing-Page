
import React from 'react';
import { Link } from 'react-router-dom';
import ServicesHeader from '../components/services/ServicesHeader';
import ServicesHero from '../components/services/ServicesHero';
import ServicesFooter from '../components/services/ServicesFooter';
import { blogPosts } from '../lib/blogPosts';

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
        name: 'AI Sales System',
        tagline: 'Fill your pipeline and follow up automatically',
        description: 'Cold email with smart autoresponders, instant lead response, and AI follow-up that keeps prospects moving until they book.',
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
            { title: 'Automatic Follow-Up', description: 'Autoresponders and AI follow-up keep every prospect warm without manual chasing.' },
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
        name: 'AI-Powered SEO',
        tagline: 'Rank higher, get found, grow organically',
        description: 'AI-assisted research, content, and optimization that drive long-term traffic from Google and AI search.',
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

const growthSystems = [
    {
        name: 'Sales System',
        headline: 'Never let a lead go cold',
        description: 'Every inquiry gets an instant reply, and every prospect gets followed up until they book.',
        features: ['Instant lead response by text and email', 'Cold email with smart autoresponders', 'AI follow-up and pipeline automation'],
        link: '/services/lead-generation',
        icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    },
    {
        name: 'Marketing System',
        headline: 'Get found and stay top of mind',
        description: 'AI does the heavy lifting on content and targeting so you show up where buyers are looking.',
        features: ['AI-powered SEO', 'AI-powered marketing campaigns', 'Content that publishes on schedule'],
        link: '/services/seo',
        icon: 'M3 3v18h18M7 14l4-4 4 4 5-5',
    },
    {
        name: 'Reputation System',
        headline: 'Turn happy customers into growth',
        description: 'Reviews, referrals, and repeat business, requested automatically at the right moment.',
        features: ['Automated review requests', 'Past-customer reactivation', 'AI chat that answers 24/7'],
        link: '/services/review-automation',
        icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    },
];

const processSteps = [
    { step: '01', title: 'Audit', description: 'We map where leads come in, where they leak out, and what your team does by hand today.' },
    { step: '02', title: 'Install', description: 'We build and connect the system to your website, inbox, phone, and CRM. You don\'t touch the tech.' },
    { step: '03', title: 'Optimize', description: 'We watch the numbers every month and tune messages, timing, and targeting to keep improving.' },
];

const ServicesOverview: React.FC = () => {
    const latestPosts = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3);

    return (
        <div className="min-h-screen bg-white text-black selection:bg-primary selection:text-black">
            <ServicesHeader />
            <main>
                <ServicesHero />

                <section id="systems" className="py-20 sm:py-28 bg-offWhite scroll-mt-20">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-black mb-4">
                                Three systems. One growth engine.
                            </h2>
                            <p className="text-lg text-charcoal/60 max-w-2xl mx-auto">
                                Start with the one that fixes your biggest leak, or run all three together.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {growthSystems.map((system) => (
                                <Link
                                    key={system.name}
                                    to={system.link}
                                    className="group flex flex-col bg-white border border-black/5 rounded-3xl p-8 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-6">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                                            <path d={system.icon} />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{system.name}</span>
                                    <h3 className="text-2xl font-bold text-black mb-3">{system.headline}</h3>
                                    <p className="text-charcoal/60 mb-6 leading-relaxed">{system.description}</p>
                                    <ul className="space-y-2 mb-8">
                                        {system.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2 text-sm font-medium text-charcoal/80">
                                                <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <span className="mt-auto inline-flex items-center gap-2 text-black font-semibold group-hover:gap-3 transition-all">
                                        Learn more
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="process" className="py-20 sm:py-28 bg-white scroll-mt-20">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-14">
                            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-black mb-4">
                                How it works
                            </h2>
                            <p className="text-lg text-charcoal/60 max-w-2xl mx-auto">
                                You run the business. We build the machine behind it.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
                            {processSteps.map((item) => (
                                <div key={item.step} className="border-t-2 border-primary pt-6">
                                    <span className="text-sm font-bold text-charcoal/40">{item.step}</span>
                                    <h3 className="text-2xl font-bold text-black mt-2 mb-3">{item.title}</h3>
                                    <p className="text-charcoal/60 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {latestPosts.length > 0 && (
                    <section className="py-20 sm:py-24 bg-offWhite">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6">
                            <div className="flex items-end justify-between gap-4 mb-10">
                                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
                                    From the blog
                                </h2>
                                <Link to="/blog" className="text-sm font-bold text-charcoal/60 hover:text-black whitespace-nowrap">
                                    All posts &rarr;
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {latestPosts.map((post) => (
                                    <Link
                                        key={post.slug}
                                        to={`/blog/${post.slug}`}
                                        className="group block bg-white border border-black/5 rounded-3xl p-6 hover:border-primary/40 hover:shadow-xl transition-all"
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wide text-primary">{post.pillar}</span>
                                        <h3 className="text-lg font-bold text-black mt-2 mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                                        <p className="text-sm text-charcoal/60 leading-relaxed">{post.excerpt}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <ServicesFooter />
        </div>
    );
};

export default ServicesOverview;
