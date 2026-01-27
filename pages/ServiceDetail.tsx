
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { serviceCategories } from './ServicesOverview';
import ServicesHeader from '../components/services/ServicesHeader';
import ServicesFooter from '../components/services/ServicesFooter';
import PricingTier from '../components/services/PricingTier';

const ServiceDetail: React.FC = () => {
    const { serviceId } = useParams<{ serviceId: string }>();
    const service = serviceCategories.find(s => s.id === serviceId);

    // Redirect to overview if service not found
    if (!service) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-white text-black selection:bg-primary selection:text-black">
            <ServicesHeader categories={serviceCategories} />
            <main>
                {/* Hero Section */}
                <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-white to-offWhite">
                    {/* Decorative elements */}
                    <div className="absolute top-1/3 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

                    <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
                        {/* Breadcrumb */}
                        <div className="mb-8">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-charcoal/60 hover:text-primary transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Back to All Services
                            </Link>
                        </div>

                        <div className="text-center">
                            <div className="text-6xl sm:text-7xl mb-6">{service.icon}</div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-black">
                                {service.name}
                            </h1>
                            <p className="text-xl sm:text-2xl text-charcoal/60 max-w-3xl mx-auto mb-10 leading-relaxed">
                                {service.description}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href="#pricing"
                                    className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl inline-flex items-center gap-2"
                                >
                                    View Pricing
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </a>
                                <a
                                    href="#contact"
                                    className="bg-white text-black border-2 border-black/10 px-8 py-4 rounded-full font-bold text-lg hover:border-primary transition-all"
                                >
                                    Get Custom Quote
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Value Propositions */}
                <section className="py-16 sm:py-24 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                                Why Choose Our {service.name}?
                            </h2>
                            <p className="text-lg text-charcoal/60">
                                Here's what sets us apart from the rest.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {service.valueProps.map((prop, index) => (
                                <div
                                    key={index}
                                    className="bg-offWhite rounded-2xl p-8 hover:shadow-lg transition-shadow"
                                >
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-black mb-3">{prop.title}</h3>
                                    <p className="text-charcoal/60 leading-relaxed">{prop.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Social Proof */}
                <section className="py-16 sm:py-24 bg-offWhite">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                                Trusted by Growing Businesses
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Stats */}
                            <div className="bg-white rounded-2xl p-8 text-center">
                                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">🇺🇸</div>
                                <div className="text-charcoal/60 font-medium">Nationwide Service</div>
                            </div>
                            <div className="bg-white rounded-2xl p-8 text-center">
                                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">4.9★</div>
                                <div className="text-charcoal/60 font-medium">Average Rating</div>
                            </div>
                            <div className="bg-white rounded-2xl p-8 text-center">
                                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">2x</div>
                                <div className="text-charcoal/60 font-medium">Avg. Growth Rate</div>
                            </div>
                        </div>

                        {/* Testimonial placeholder */}
                        <div className="mt-12 bg-white rounded-2xl p-8 sm:p-12 text-center max-w-3xl mx-auto">
                            <svg className="w-12 h-12 text-primary/20 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                            <p className="text-xl sm:text-2xl text-charcoal/80 italic mb-6 leading-relaxed">
                                "Working with Local Sun Digital transformed our business. Their {service.name.toLowerCase()} service delivered results beyond our expectations."
                            </p>
                            <div className="font-bold text-black">Satisfied Client</div>
                            <div className="text-charcoal/60 text-sm">Local Business Owner</div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-16 sm:py-24 bg-white scroll-mt-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                                Choose Your Plan
                            </h2>
                            <p className="text-lg text-charcoal/60">
                                Transparent pricing with no hidden fees. Cancel anytime.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {service.tiers.map((tier, index) => (
                                <PricingTier key={index} tier={tier} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section id="contact" className="py-16 sm:py-24 bg-black text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                            Ready to Get Started with {service.name}?
                        </h2>
                        <p className="text-xl text-white/70 mb-8">
                            Book a free consultation and let's discuss how we can help grow your business.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="/contact"
                                className="bg-primary text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform inline-flex items-center gap-2"
                            >
                                Book Free Consultation
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                            <Link
                                to="/"
                                className="text-white/70 hover:text-white font-medium transition-colors"
                            >
                                ← Explore Other Services
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <ServicesFooter />
        </div>
    );
};

export default ServiceDetail;
